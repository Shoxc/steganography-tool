import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileImage, LockKeyhole, Upload } from "lucide-react";

export default function App() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [uploadedPublicKeyFile, setUploadedPublicKeyFile] = useState<File | null>(null);
    const [uploadedPrivateKeyFile, setUploadedPrivateKeyFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">("encrypt");
    const [customFilename, setCustomFilename] = useState("stego-image");

    useEffect(() => {
        initializeKeyPair();
    }, []);

    const initializeKeyPair = async () => {
      try {
        const { generateKeyPair } = await import("./utils/crypto");
        const { publicKey: pubKey, privateKey: privKey } = await generateKeyPair();

        setPublicKey(pubKey);
        setPrivateKey(privKey);

        console.log("Generated RSA key pair.");
      } catch (err) {
        console.error("Error generating key pair:", err);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleEncryptAndHide = async () => {
        if (!imageFile || !message || !publicKey) {
            alert("Please upload an image, enter a message, and provide a public key.");
            return;
        }

        try {
            const { encryptMessage } = await import("./utils/crypto");
            const { encodeMessageIntoImage } = await import("./utils/stego");

            console.log("Message:", message);
            console.log("Public Key:", publicKey);

            let encrypted = "";
            try {
                let publicKeyToUse = publicKey;
                if (uploadedPublicKeyFile) {
                    publicKeyToUse = await uploadedPublicKeyFile.text();
                }
                encrypted = encryptMessage(message, publicKeyToUse);
                console.log("Encrypted:", encrypted);
            } catch (err) {
                console.error("Encryption error:", err);
                alert("Failed to encrypt message. Check the public key format.");
                return;
            }

            const canvas = await encodeMessageIntoImage(imageFile, encrypted);

            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `${customFilename || "stego-image"}.png`;
            link.click();
        } catch (err) {
            console.error(err);
            alert("An error occurred while encrypting or hiding the message.");
        }
    };

    const handleExtractAndDecrypt = async () => {
        if (!imageFile || !privateKey) {
            alert("Please upload an image and provide a private key.");
            return;
        }

        try {
            const { decryptMessage } = await import("./utils/crypto");
            const { decodeMessageFromImage } = await import("./utils/stego");

            const img = new Image();
            const url = URL.createObjectURL(imageFile);

            img.onload = async () => {
                try {
                    const hiddenMessage = decodeMessageFromImage(img);
                    let privateKeyToUse = privateKey;
                    if (uploadedPrivateKeyFile) {
                        privateKeyToUse = await uploadedPrivateKeyFile.text();
                    }
                    const decrypted = decryptMessage(hiddenMessage, privateKeyToUse);
                    alert("Decrypted Message:\n" + decrypted);
                } catch (err) {
                    console.error(err);
                    alert("Decryption failed. Check the private key.");
                }
            };

            img.src = url;
        } catch (err) {
            console.error(err);
            alert("An error occurred while extracting or decrypting the message.");
        }
    };

    const downloadKey = (filename: string, content: string) => {
        const blob = new Blob([content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-200 to-indigo-200 p-8">
            <h1 className="text-4xl font-bold text-center text-indigo-800 drop-shadow">Steganography Tool</h1>
            <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 space-y-6">
                <div className="flex gap-4 mb-4">
                    <Button
                        onClick={() => setActiveTab("encrypt")}
                        className={`${
                            activeTab === "encrypt"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                    >
                        Encrypt Message
                    </Button>
                    <Button
                        onClick={() => setActiveTab("decrypt")}
                        className={`${
                            activeTab === "decrypt"
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                    >
                        Decrypt Message
                    </Button>
                </div>
                {activeTab === "encrypt" && (
                    <>
                        <Card className="bg-white rounded-lg shadow-md border border-gray-200">
                            <CardContent className="space-y-4 p-4">
                                <h2 className="text-xl font-semibold">Step 1: Upload Image</h2>
                                <Input type="file" accept="image/png" onChange={handleFileChange} />
                            </CardContent>
                        </Card>
                        <Card className="bg-white rounded-lg shadow-md border border-gray-200">
                            <CardContent className="space-y-4 p-4">
                                <h2 className="text-xl font-semibold">Step 2: Enter Message</h2>
                                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Secret message..." />
                            </CardContent>
                        </Card>
                        <Card className="bg-white rounded-lg shadow-md border border-gray-200">
                            <CardContent className="space-y-4 p-4">
                                <h2 className="text-xl font-semibold">Step 3: RSA Keys</h2>
                                <div className="space-y-2">
                                    <p>RSA keypair is generated and used in the browser.</p>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="secondary"
                                            onClick={() => downloadKey("public.pem", publicKey)}
                                        >
                                            Download Public Key
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => downloadKey("private.pem", privateKey)}
                                        >
                                            Download Private Key
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white rounded-lg shadow-md border border-gray-200">
                          <CardContent className="space-y-4 p-4">
                            <h2 className="text-xl font-semibold">Step 4: Filename</h2>
                            <Input
                              type="text"
                              placeholder="Enter custom filename (no extension)"
                              value={customFilename}
                              onChange={(e) => setCustomFilename(e.target.value)}
                            />
                          </CardContent>
                        </Card>
                        <div className="flex gap-4">
                            <Button onClick={handleEncryptAndHide} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                <LockKeyhole size={16}/> Encrypt & Hide
                            </Button>
                        </div>
                    </>
                )}
                {activeTab === "decrypt" && (
                    <>
                        <Card className="bg-white rounded-lg shadow-md border border-gray-200">
                            <CardContent className="space-y-4 p-4">
                                <h2 className="text-xl font-semibold">Step 1: Upload Image</h2>
                                <Input type="file" accept="image/png" onChange={handleFileChange} />
                            </CardContent>
                        </Card>
                        <Card className="bg-white rounded-lg shadow-md border border-gray-200">
                            <CardContent className="space-y-4 p-4">
                                <h2 className="text-xl font-semibold">Step 2: RSA Keys</h2>
                                <div className="space-y-2">
                                    <div className="flex flex-col gap-2 mt-4">
                                        Please provide your public key.
                                        <Input
                                            type="file"
                                            accept=".pem"
                                            onChange={(e) => setUploadedPublicKeyFile(e.target.files?.[0] ?? null)}
                                        />
                                        Please provide your private key.
                                        <Input
                                            type="file"
                                            accept=".pem"
                                            onChange={(e) => setUploadedPrivateKeyFile(e.target.files?.[0] ?? null)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex gap-4">
                            <Button onClick={handleExtractAndDecrypt} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                                <Upload size={16}/> Extract & Decrypt
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}