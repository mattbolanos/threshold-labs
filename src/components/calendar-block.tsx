import { FootprintsIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CalendarBlock() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FootprintsIcon className="size-6" />
          New Workout
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
