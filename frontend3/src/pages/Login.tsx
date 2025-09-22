import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useAuthStore from "@/lib/stores/auth-store";
import { Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({
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
      console.log("Submitting login form:", { email: formData.email });
      await login(formData.email, formData.password);
      toast({
        title: "Login successful!",
        description: "Welcome back to ProjectFlow.",
      });
      navigate("/");
    } catch (err: any) {
      console.error("Login form error:", err);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error || "Please check your credentials and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-surface/50 backdrop-blur-sm border-border/50">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <p className="text-muted-foreground text-center">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
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
                disabled={loading}
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}