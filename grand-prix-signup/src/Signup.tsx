import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axios from "axios";

interface AuthResponse {
  success: boolean;
  user?: {
    name: string;
    email: string;
    picture: string;
  };
}

export default function Signup() {
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await axios.post<AuthResponse>(
        "http://localhost:5000/api/auth/google",
        {
          credential: credentialResponse.credential,
        },
      );

      if (response.data.success && response.data.user) {
        setMessage(
          `Welcome, ${response.data.user.name}! You're on the beta list.`,
        );
        setIsError(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("Signup failed. Please try again.");
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-f1-dark flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-black text-white italic mb-2">
          GRAND PRIX
          <span className="block text-f1-red not-italic">TEAM PRINCIPLE</span>
        </h1>
        <p className="text-gray-400 mb-8">
          Join the beta and build your legacy.
        </p>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              setMessage("Google signup failed.");
              setIsError(true);
            }}
            theme="filled_black"
            shape="pill"
            size="large"
            text="signup_with"
          />
        </div>

        {message && (
          <p
            className={`mt-6 text-sm font-medium ${isError ? "text-red-400" : "text-green-400"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
