"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retriever = exports.Retriever = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const STOP_WORDS = new Set([
    // English
    "the", "is", "at", "which", "on", "and", "a", "an", "to", "of", "in", "for", "with", "that", "this", "it", "as", "are", "was", "be", "by", "or", "from", "have", "has", "but", "not", "they", "you", "i",
    // Vietnamese common words
    "và", "của", "là", "trong", "có", "được", "việc", "công", "người", "thời", "gian", "địa", "điểm", "nội", "dung", "yêu", "cầu", "hướng", "dẫn", "chỉ", "tên", "vị", "kính", "gửi", "ghi", "chú", "mô", "tả", "nếu", "có", "không", "chúng", "tôi", "bạn", "hoặc", "đó", "này", "kia"
]);
function tokenize(text) {
    return text
        .toLowerCase()
        .split(/[^\p{L}0-9]+/u)
        .filter((t) => t && !STOP_WORDS.has(t));
}
class Retriever {
    chunks = [];
    idf = new Map();
    constructor() {
        this.buildIndex();
    }
    readKnowledgeDir() {
        const dir = path_1.default.resolve(process.cwd(), "data/knowledge");
        try {
            console.log("Retriever: Reading knowledge directory from:", dir);
            if (!fs_1.default.existsSync(dir)) {
                console.warn("Retriever: Knowledge directory does not exist:", dir);
                return [];
            }
            const files = fs_1.default.readdirSync(dir).filter((f) => f.endsWith(".txt"));
            console.log("Retriever: Found files:", files);
            return files.map((f) => fs_1.default.readFileSync(path_1.default.join(dir, f), "utf8"));
        }
        catch (err) {
            console.error("Retriever.readKnowledgeDir error:", err);
            return [];
        }
    }
    chunkText(text, maxChars = 1000) {
        const parts = [];
        let buffer = "";
        const paragraphs = text.split(/\n+/).filter((p) => p.trim());
        for (const p of paragraphs) {
            if ((buffer + "\n" + p).length > maxChars) {
                if (buffer)
                    parts.push(buffer.trim());
                buffer = p;
            }
            else {
                buffer = buffer ? buffer + "\n" + p : p;
            }
        }
        if (buffer)
            parts.push(buffer.trim());
        return parts;
    }
    buildIndex() {
        try {
            const docs = this.readKnowledgeDir();
            const allTerms = new Map();
            let chunkId = 0;
            for (const doc of docs) {
                const parts = this.chunkText(doc);
                for (const part of parts) {
                    const terms = tokenize(part);
                    const tf = new Map();
                    for (const t of terms)
                        tf.set(t, (tf.get(t) || 0) + 1);
                    for (const t of new Set(terms))
                        allTerms.set(t, (allTerms.get(t) || 0) + 1);
                    this.chunks.push({ id: String(chunkId++), text: part, tf, norm: 0 });
                }
            }
            // compute idf
            const N = this.chunks.length || 1;
            for (const [term, df] of allTerms.entries()) {
                this.idf.set(term, Math.log(1 + N / df));
            }
            // compute tf-idf norms
            for (const chunk of this.chunks) {
                let sum = 0;
                for (const [t, f] of chunk.tf.entries()) {
                    const idf = this.idf.get(t) || 0;
                    const val = f * idf;
                    sum += val * val;
                }
                chunk.norm = Math.sqrt(sum) || 1;
            }
            console.log(`Retriever: indexed ${this.chunks.length} chunks from knowledge directory`);
        }
        catch (err) {
            console.error("Retriever.buildIndex error:", err);
        }
    }
    async getRelevantDocs(query, topK = 3) {
        if (!query || this.chunks.length === 0)
            return "";
        const terms = tokenize(query);
        const qtf = new Map();
        for (const t of terms)
            qtf.set(t, (qtf.get(t) || 0) + 1);
        // build query tf-idf
        let qnorm = 0;
        const qvals = new Map();
        for (const [t, f] of qtf.entries()) {
            const idf = this.idf.get(t) || Math.log(1 + this.chunks.length);
            const val = f * idf;
            qvals.set(t, val);
            qnorm += val * val;
        }
        qnorm = Math.sqrt(qnorm) || 1;
        // score chunks
        const scores = [];
        for (let i = 0; i < this.chunks.length; i++) {
            const c = this.chunks[i];
            let dot = 0;
            for (const [t, qv] of qvals.entries()) {
                const tf = c.tf.get(t) || 0;
                const idf = this.idf.get(t) || 0;
                dot += qv * (tf * idf);
            }
            const score = dot / (c.norm * qnorm) || 0;
            scores.push({ idx: i, score });
        }
        scores.sort((a, b) => b.score - a.score);
        const top = scores.slice(0, topK).filter((s) => s.score > 0);
        const result = top.map((t) => this.chunks[t.idx].text).join("\n\n---\n\n");
        return result;
    }
}
exports.Retriever = Retriever;
exports.retriever = new Retriever();
