import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmailVerificationProps {
  email: string;
  isVerified: boolean;
  userId: string;
  onVerificationComplete: () => void;
}

export function EmailVerification({ email, isVerified, userId, onVerificationComplete }: EmailVerificationProps) {
  const [verificationToken, setVerificationToken] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/verify/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link."
      });
      setShowVerificationInput(true);
      // In development mode, show the token for testing
      if (data.token) {
        console.log("Development verification token:", data.token);
        toast({
          title: "Development Mode",
          description: `Verification token: ${data.token}`,
          duration: 10000
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send verification email",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/verify/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: verificationToken })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email verified successfully",
        description: "Your email address has been verified."
      });
      setShowVerificationInput(false);
      setVerificationToken("");
      queryClient.invalidateQueries();
      onVerificationComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Please check your verification token.",
        variant: "destructive"
      });
    }
  });

  const handleSendVerification = () => {
    sendVerificationMutation.mutate();
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationToken.trim()) {
      toast({
        title: "Verification token required",
        description: "Please enter your verification token.",
        variant: "destructive"
      });
      return;
    }
    verifyEmailMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Verification
        </CardTitle>
        <CardDescription>
          Verify your email address to secure your account and receive important notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{email}</span>
          </div>
          {isVerified ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unverified
            </Badge>
          )}
        </div>

        {!isVerified && (
          <div className="space-y-4">
            {!showVerificationInput ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your email address is not verified. Click the button below to send a verification email.
                </p>
                <Button 
                  onClick={handleSendVerification} 
                  disabled={sendVerificationMutation.isPending}
                  className="w-full"
                >
                  {sendVerificationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending verification email...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send verification email
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-token">Verification Token</Label>
                  <Input
                    id="email-token"
                    type="text"
                    placeholder="Enter verification token from email"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Check your email for the verification token and enter it above.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={verifyEmailMutation.isPending}
                    className="flex-1"
                  >
                    {verifyEmailMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Verify Email
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowVerificationInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {isVerified && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Your email is verified</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              You'll receive important notifications at this email address.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}