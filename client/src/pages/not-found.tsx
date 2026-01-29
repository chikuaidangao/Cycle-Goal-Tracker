import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="max-w-md text-center space-y-6 p-6">
        <div className="flex justify-center">
          <AlertCircle className="h-24 w-24 text-muted-foreground/20" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground">
          404 Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="mt-4">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
