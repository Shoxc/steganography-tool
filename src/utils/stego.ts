// Helper: Convert string to binary string
function stringToBinary(str: string): string {
    return str.split("")
        .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("");
}

// Helper: Convert binary string to plain text
function binaryToString(binary: string): string {
    const bytes = binary.match(/.{1,8}/g);
    if (!bytes) return "";
    return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join("");
}

// Embed message into image data
export async function encodeMessageIntoImage(imageFile: File, message: string): Promise<HTMLCanvasElement> {
    const image = new Image();
    const url = URL.createObjectURL(imageFile);

    return new Promise((resolve, reject) => {
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Canvas context not available");

            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const binaryMessage = stringToBinary(message) + "00000000".repeat(2); // Delimiter
            const data = imageData.data;

            if (binaryMessage.length > data.length) {
                return reject("Message is too long to hide in this image.");
            }

            for (let i = 0; i < binaryMessage.length; i++) {
                data[i] = (data[i] & 0xfe) | parseInt(binaryMessage[i]); // LSB
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas);
        };

        image.onerror = reject;
        image.src = url;
    });
}

// Decode message from image data
export function decodeMessageFromImage(image: HTMLImageElement): string {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let binary = "";
    for (let i = 0; i < data.length; i++) {
        binary += (data[i] & 1).toString();
    }

    const bytes = binary.match(/.{1,8}/g);
    if (!bytes) return "";

    let message = "";
    for (const byte of bytes) {
        const char = String.fromCharCode(parseInt(byte, 2));
        if (char === "\0") break;
        message += char;
    }

    return message;
}