// Service to read and manage Word document content

export interface DocumentContent {
  text: string;
  length: number;
  readAt: Date;
}

/**
 * Reads the current document content from Word
 * @returns Document content or null if unable to read
 */
export const readCurrentDocument = async (): Promise<DocumentContent | null> => {
  try {
    console.log("Starting to read document...");
    await Word.run(async (context) => {
      // Get the body of the document
      const body = context.document.body;
      console.log("Document body accessed");
      
      // Load the text content
      body.load("text");
      console.log("Text loaded for body");
      
      // Sync to execute the request
      await context.sync();
      console.log("Document sync completed");
      
      // Store the text for return (using a module variable since we can't return from Word.run directly)
      (window as any).documentText = body.text;
      console.log("Document text stored:", body.text.length, "characters");
    });

    const documentText = (window as any).documentText || "";
    console.log("Document text retrieved:", documentText.length, "characters");
    
    if (!documentText) {
      console.log("Document is empty");
      return null;
    }

    const result = {
      text: documentText,
      length: documentText.length,
      readAt: new Date(),
    };
    
    console.log("Returning document content:", result);
    return result;
  } catch (error) {
    console.error("Error reading document:", error);
    return null;
  }
};

/**
 * Prepares document content as context for the AI
 * @param documentContent Document content to format
 * @returns Formatted context string for AI
 */
export const formatDocumentAsContext = (documentContent: DocumentContent): string => {
  // Limit the document length to avoid sending too much data
  const maxLength = 4000;
  const truncatedText = documentContent.text.substring(0, maxLength);
  const truncationNote = documentContent.text.length > maxLength 
    ? `\n[Tài liệu được cắt ngắn từ ${documentContent.text.length} ký tự còn ${maxLength} ký tự]` 
    : "";
  
  return `Nội dung tài liệu Word hiện tại:\n\n${truncatedText}${truncationNote}`;
};

/**
 * Checks if document content has changed since last read
 * @param previousContent Previous document content
 * @returns True if document has changed
 */
export const hasDocumentChanged = async (previousContent: DocumentContent | null): Promise<boolean> => {
  const currentContent = await readCurrentDocument();
  
  if (!previousContent || !currentContent) {
    return previousContent !== currentContent;
  }
  
  return previousContent.text !== currentContent.text;
};
