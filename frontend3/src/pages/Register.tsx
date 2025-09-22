import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useAuthStore from "@/lib/stores/auth-store";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error || "Please check your information and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-surface/50 backdrop-blur-sm border-border/50">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <p className="text-muted-foreground text-center">
            Sign up to get started with Project Manager
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-surface/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-surface/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-surface/50 border-border/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="text-primary p-0 h-auto"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
