import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Phone, Check, AlertCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PhoneVerificationProps {
  phone: string;
  isVerified: boolean;
  userId: string;
  onVerificationComplete: () => void;
}

export function PhoneVerification({ phone, isVerified, userId, onVerificationComplete }: PhoneVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/verify/send-sms", {
        method: "POST",
        body: { userId, phone }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Verification SMS sent",
        description: "Please check your phone for the verification code."
      });
      setShowVerificationInput(true);
      // In development mode, show the code for testing
      if (data.token) {
        console.log("Development verification code:", data.token);
        toast({
          title: "Development Mode",
          description: `Verification code: ${data.token}`,
          duration: 10000
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send verification SMS",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const verifyPhoneMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/verify/phone", {
        method: "POST",
        body: { userId, token: verificationCode }
      });
    },
    onSuccess: () => {
      toast({
        title: "Phone verified successfully",
        description: "Your phone number has been verified."
      });
      setShowVerificationInput(false);
      setVerificationCode("");
      queryClient.invalidateQueries();
      onVerificationComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Please check your verification code.",
        variant: "destructive"
      });
    }
  });

  const handleSendVerification = () => {
    sendVerificationMutation.mutate();
  };

  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast({
        title: "Verification code required",
        description: "Please enter your verification code.",
        variant: "destructive"
      });
      return;
    }
    verifyPhoneMutation.mutate();
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Simple phone number formatting for display
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone number to enable SMS notifications and secure your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatPhoneNumber(phone)}</span>
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
                  Your phone number is not verified. Click the button below to receive a verification code via SMS.
                </p>
                <Button 
                  onClick={handleSendVerification} 
                  disabled={sendVerificationMutation.isPending}
                  className="w-full"
                >
                  {sendVerificationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending verification SMS...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Send verification SMS
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleVerifyPhone} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-code">Verification Code</Label>
                  <Input
                    id="phone-code"
                    type="text"
                    placeholder="Enter 6-digit verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    className="text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your phone number.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={verifyPhoneMutation.isPending}
                    className="flex-1"
                  >
                    {verifyPhoneMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Verify Phone
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSendVerification}
                  disabled={sendVerificationMutation.isPending}
                  className="w-full"
                >
                  Resend verification code
                </Button>
              </form>
            )}
          </div>
        )}

        {isVerified && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Your phone is verified</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              You'll receive SMS notifications at this phone number.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}