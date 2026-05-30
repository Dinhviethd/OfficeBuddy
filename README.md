# 🤖 eOFFICE AI VIRTUAL ASSISTANT
> **Hệ thống Trợ lý Văn phòng AI & Soạn thảo Văn bản Hành chính**  
> *Dự án nghiên cứu & ứng dụng thực tế dành cho Cán bộ, Giảng viên và Sinh viên Trường Đại học Bách Khoa - Đại học Đà Nẵng (DUT)*

---

## 📌 1. Giới thiệu Dự án
**eOffice AI Virtual Assistant** là một hệ thống trợ lý ảo thông minh tích hợp trí tuệ nhân tạo, được thiết kế để giải quyết hai nhiệm vụ cốt lõi trong môi trường hành chính giáo dục:
1. **Tra cứu quy chế & thông tin nội bộ nhanh chóng (RAG Q&A):** Hỗ trợ trả lời chính xác các quy định về đào tạo, khảo thí, công tác sinh viên, học phí... và danh bạ liên hệ của trường thông qua Chatbot thông minh trên Web Portal.
2. **Tự động hóa soạn thảo văn bản hành chính (Document Generation Add-in):** Trợ lý chuyên biệt chạy trực tiếp bên trong Microsoft Word dưới dạng Add-in, giúp cán bộ và sinh viên tạo lập nhanh chóng các biểu mẫu đơn từ (miễn học ngoại ngữ, hoãn học GDQP, xét tốt nghiệp, gia hạn học phí...) chuẩn thể thức hành chính Nhà nước và chèn trực tiếp vào văn bản chỉ bằng 1 cú click chuột.

---

## 🎨 2. Phân Tách Không Gian Tương Tác (Interaction Spaces)
Dự án được phân tách rõ ràng thành hai không gian tương tác độc lập để tối ưu hóa trải nghiệm người dùng:

### A. Web Portal (Cổng Thông Tin eOffice)
* **Vai trò:** Không gian tra cứu, hỏi đáp quy định học đường và thông tin nội bộ.
* **Giao diện:** Thiết kế giao diện hiện đại với **vòng tròn Chatbot bong bóng nổi (Floating Chat Bubble)** ở góc dưới bên phải. Giao diện được lấy cảm hứng từ ngôn ngữ thiết kế Fluent Design của Microsoft, phối màu HSL cao cấp và hỗ trợ hiệu ứng micro-animations mượt mà.
* **Tính năng:**
  * Tra cứu nhanh theo từ khóa bằng AI.
  * Các thẻ danh mục tài liệu trực quan (Biểu mẫu, Đào tạo, Khảo thí, Công tác sinh viên, Danh bạ nhân sự...). Nhấp vào thẻ sẽ tự động đề xuất câu hỏi thông minh liên quan đến danh mục đó.

### B. Microsoft Word Add-in (Trợ lý Soạn thảo chuyên biệt)
* **Vai trò:** Không gian soạn thảo chuyên sâu, loại bỏ hoàn toàn các tab chat rườm rà để tập trung tối đa vào **tạo lập tài liệu (Document Generation)**.
* **Giao diện:** Chạy trực tiếp trên thanh Taskpane của Word (React + Office.js).
* **Tính năng:**
  * **Nhập liệu theo Form:** Hỗ trợ 6 biểu mẫu thực tế của sinh viên DUT (Đơn xin cấp lại chứng chỉ GDQP-AN, Đơn xin miễn học/chuyển điểm Ngoại ngữ, Đơn xin hoãn học GDQP, Đơn xin gia hạn học phí, Đơn xin chuyển chương trình đào tạo, Đơn xin xét tốt nghiệp Kỹ sư).
  * **Yêu cầu tự do:** Cho phép viết lời mô tả tự nhiên (ví dụ: *"Soạn tờ trình xin mua 5 máy tính cho phòng kế toán..."*) để AI tự động thiết kế cấu trúc văn bản.
  * **Chèn trực tiếp vào Word (Word.js API):** Chỉ cần bấm nút **"📥 Chèn vào Word"**, toàn bộ văn bản hành chính vừa tạo sẽ được đưa trực tiếp vào trang văn bản Word hiện hành ngay tại vị trí con trỏ chuột.

---

## 📐 3. Kiến Trúc Hệ Thống & Luồng Dữ Liệu (Flow)

```mermaid
graph TD
    %% Clients
    subgraph Clients [Không gian Tương tác]
        WP[Web Portal - Floating Chatbot]
        WA[Word Add-in - Taskpane React]
    end

    %% API Server
    subgraph Server [Backend Express API Server - Cổng 8000]
        Router[Router /api/ai]
        Ctrl[AI Controller]
        RAG[RAG Service]
        Embed[Gemini Embedding Model -001]
        LLM[Gemini 2.5 Flash LLM]
    end

    %% Vector Database
    subgraph DB [Cơ sở dữ liệu Supabase]
        PgVector[(pgvector - match_documents)]
    end

    %% Connections
    WP -- "Hỏi đáp Q&A (CORS)" --> Router
    WA -- "Yêu cầu Soạn thảo (CORS)" --> Router
    Router --> Ctrl
    Ctrl --> RAG
    
    %% RAG Pipeline
    RAG -- "1. Vector hóa câu hỏi" --> Embed
    Embed -- "Embedding Vector (768d)" --> RAG
    RAG -- "2. Tìm kiếm tương tự (RPC)" --> PgVector
    PgVector -- "3. Trả về Chunk tài liệu liên quan" --> RAG
    RAG -- "4. Tổng hợp Context + Prompt" --> LLM
    LLM -- "5. Trả về câu trả lời / Văn bản hành chính" --> RAG
    RAG --> Ctrl
    Ctrl --> WP
    Ctrl --> WA
```

---

## 🧠 4. Cơ chế Pipeline RAG (Retrieval-Augmented Generation)

### 1. Vector hóa Dữ liệu (Text Embedding)
* **Model sử dụng:** `gemini-embedding-001` (Google Generative AI).
* **Đặc tính:** Chuyển đổi các đoạn văn bản (chunks) từ quy chế của trường thành các vector toán học **768 chiều** và lưu trữ trong cơ sở dữ liệu Supabase hỗ trợ tiện ích mở rộng `pgvector`.
* **Lý do duy trì model:** Dữ liệu quy chế nội bộ đã được cấu trúc và index trước bằng model `gemini-embedding-001` trong database. Việc giữ nguyên model này đảm bảo tính tương thích và độ chính xác tối đa khi so khớp vector.

### 2. Tìm kiếm Tương tự (Vector Similarity Match)
* Gọi trực tiếp hàm RPC `match_documents` trong Supabase để tính toán khoảng cách Cosine giữa Vector câu hỏi và cơ sở dữ liệu.
* Bộ lọc ngưỡng chính xác `match_threshold: 0.3` giúp lọc bỏ các nhiễu thông tin không liên quan.

### 3. Thuật toán Ưu tiên đặc biệt cho "Danh bạ nhân sự" (Contact Priority Rule)
Để giải quyết bài toán thông tin danh bạ thay đổi nhanh và yêu cầu tính chính xác tuyệt đối (không được phép sinh ảo giác AI về số điện thoại, chức vụ của Hiệu trưởng, Trưởng phòng...), hệ thống tích hợp bộ lọc logic thông minh:
* **Nhận diện từ khóa:** Khi câu hỏi của người dùng chứa các từ khóa liên quan đến nhân sự, liên hệ (`hiệu trưởng`, `trưởng phòng`, `sđt`, `email`, `liên hệ`, `thầy`, `cô`...).
* **Truy xuất mở rộng:** Hệ thống tự động nâng số lượng bản ghi so khớp tối đa (`match_count`) lên **100** trong cơ sở dữ liệu đối với danh mục `"danh-ba"`.
* **Bộ lọc bộ nhớ (In-memory Filtering):** Tiến hành lọc và hợp nhất các bản ghi từ tệp danh bạ Excel gốc (`DanhBa_DUT_edited.xlsx` đã lưu trong DB) trước khi gửi tới LLM.
* **Chỉ thị Hệ thống (System Instruction):**
  > **Quan trọng:** Khi có nhiều nguồn mâu thuẫn nhau, ưu tiên thông tin từ thư mục "Danh bạ" (file "DanhBa_DUT_edited.xlsx"). Khi hỏi về nhân sự, CHỈ lấy thông tin từ nguồn này và bỏ qua tất cả các văn bản quy chế cũ.

---

## 🛠️ 5. Công Nghệ & Kỹ Thuật Nổi Bật

### A. Công nghệ Sử dụng
* **Frontend (Add-in):** React 18, TypeScript, Office.js (Word API v1.1+), Webpack, Babel.
* **Frontend (Web Portal):** HTML5, HSL-tailored CSS, Vanilla JS.
* **Backend:** Node.js, Express, TypeScript, TypeORM, `@google/generative-ai` (Gemini SDK), `@supabase/supabase-js`, `mammoth` (đọc file `.docx`), `xlsx` (đọc danh bạ Excel).
* **Database:** Supabase PostgreSQL + `pgvector`.

### B. Giải pháp Kỹ thuật Độc đáo Đã Giải quyết (Key Gotchas)
1. **Lỗi DNS IPv6 trên Supabase (Direct URL ENOTFOUND):**
   * *Hiện tượng:* Các nhà mạng hoặc mạng IPv4 không thể giải quyết tên miền trực tiếp của Supabase (`db.[ref].supabase.co`), gây lỗi sập kết nối database.
   * *Giải pháp:* Sử dụng **Connection Pooler** với cổng `6543` và tham số `?pgbouncer=true` hỗ trợ dual-stack IPv4/IPv6, đảm bảo kết nối thông suốt ở mọi môi trường mạng.
2. **Lỗi `400 Bad Request` khi gửi `systemInstruction` lên Gemini:**
   * *Hiện tượng:* Gửi `systemInstruction` dưới dạng chuỗi thô (string) trong hàm `startChat()` của Gemini SDK gây lỗi cấu trúc dữ liệu.
   * *Giải pháp:* Đóng gói `systemInstruction` thành đối tượng `Content` có cấu trúc chuẩn:
     ```typescript
     systemInstruction: {
       role: "system",
       parts: [{ text: "..." }]
     }
     ```
3. **Cơ chế Tự động Tải lại Server khi sửa cấu hình (Nodemon Env Auto-Reload):**
   * *Hiện tượng:* Khi người dùng thay đổi hoặc cập nhật `GEMINI_API_KEY` trong file `.env`, server không tự khởi động lại vì mặc định nodemon chỉ xem thay đổi trong thư mục `/src`.
   * *Giải pháp:* Cấu hình lại câu lệnh dev trong `package.json` để giám sát trực tiếp file `.env`:
     ```json
     "dev": "nodemon --watch ./src --watch .env --ext ts --exec ts-node src/main.ts"
     ```
4. **Trượt cuộn mượt mà tương thích MS Word Webview (Programmatic Auto-Scroll):**
   * *Hiện tượng:* Thao tác `scrollIntoView` chuẩn HTML5 thường bị chặn hoặc chạy không ổn định trong môi trường Add-in Word (WebView2 nhúng). Người dùng tạo văn bản xong không thấy kết quả vì nó nằm ở dưới cùng.
   * *Giải pháp:* Tạo liên kết `containerRef` đến thẻ root `.dg-root` và gọi trực tiếp hàm `.scrollTo` với khoảng trễ `setTimeout` 150ms để đợi React render xong nội dung, mang lại hiệu ứng trượt cuộn cực kỳ cao cấp và mượt mà:
     ```typescript
     setTimeout(() => {
       containerRef.current.scrollTo({
         top: containerRef.current.scrollHeight,
         behavior: "smooth"
       });
     }, 150);
     ```

---

## 🚀 6. Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống
* Node.js v18 trở lên.
* Microsoft Word (Desktop hoặc Word Online) để debug Add-in.

### Bước 1: Thiết lập cấu hình Backend (`/server`)
1. Di chuyển vào thư mục server và cài đặt thư viện:
   ```bash
   cd server
   npm install
   ```
2. Tạo file `.env` dựa theo file `.env.example` và cấu hình các khóa chính:
   ```env
   PORT=8000
   CLIENT_URL=https://localhost:3000
   
   # Cấu hình Kết nối Supabase thông qua Pooler hỗ trợ IPv4
   DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   SUPABASE_URL=https://[ref].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=ey...

   # Google Gemini API Key
   GEMINI_API_KEY=AIzaSy...
   ```
3. Chạy server ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   *Server sẽ lắng nghe tại địa chỉ: `http://localhost:8000`*

### Bước 2: Thiết lập cấu hình Client Word Add-in (`/client`)
1. Di chuyển vào thư mục client và cài đặt thư viện:
   ```bash
   cd client
   npm install
   ```
2. Cài đặt chứng chỉ SSL cục bộ để chạy HTTPS (bắt buộc đối với Word Add-in):
   ```bash
   npx office-addin-dev-certs install
   ```
3. Khởi chạy Add-in và tự động sideload vào Microsoft Word:
   ```bash
   npm start
   ```
   *Ứng dụng React sẽ chạy tại địa chỉ: `https://localhost:3000` và tự động kích hoạt một phiên bản Microsoft Word có sẵn tab "Office Buddy".*

---

## 📄 7. Thể thức văn bản hành chính đầu ra
Các văn bản do AI sinh ra (cả qua Form lẫn Yêu cầu tự do) đều được định hướng cấu trúc nghiêm ngặt theo **Nghị định 30/2020/NĐ-CP về công tác văn thư**:
* **Quốc hiệu và Tiêu ngữ:** Canh lề chuẩn, viết hoa đúng quy cách.
* **Địa danh và ngày tháng năm:** Tự động điền ngày hiện tại hoặc ngày người dùng nhập.
* **Tên loại và trích yếu nội dung:** Nổi bật, căn giữa.
* **Nội dung văn bản:** Trình bày mạch lạc, đầy đủ căn cứ pháp lý nội bộ của trường, các điều khoản và thông tin nhân sự tham chiếu từ kho dữ liệu RAG.
* **Chữ ký & Nơi nhận:** Trình bày chuyên nghiệp ở cuối văn bản. Các phần thông tin người dùng cần điền thêm được ký hiệu bằng dấu `[...]` trực quan.

---
> **Dự án phát triển bởi nhóm nghiên cứu trường Đại học Bách Khoa - Đại học Đà Nẵng.**  
> *Mọi đóng góp hoặc báo cáo lỗi xin vui lòng gửi về phòng ban quản trị hệ thống eOffice của nhà trường.*
