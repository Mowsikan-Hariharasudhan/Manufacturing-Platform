import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  features: string[];
}

const PlaceholderPage = ({ title, description, features }: PlaceholderPageProps) => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Construction className="h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-lg text-muted-foreground">{description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This section is currently under development. The following features will be available soon:
            </p>
            
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Button variant="outline" disabled>
                Feature in Development
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderPage;