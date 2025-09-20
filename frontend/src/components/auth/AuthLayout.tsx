import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = "ManufactureFlow",
  description = "From Order to Output, All in One Flow" 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {children}

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            © 2024 ManufactureFlow. Professional Manufacturing Management System.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;