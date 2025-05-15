import { ReactNode } from "react";
import { Star, User, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { AppCard, AppCardBody } from "./app-card";

interface ReviewCardProps {
  authorName: string;
  authorAvatar?: string;
  date: Date;
  rating: number; // out of 5
  review: string;
  serviceName?: string;
  className?: string;
}

/**
 * ReviewCard - Displays customer reviews with ratings
 */
export function ReviewCard({
  authorName,
  authorAvatar,
  date,
  rating,
  review,
  serviceName,
  className,
}: ReviewCardProps) {
  // Make sure rating is between 0 and 5
  const safeRating = Math.max(0, Math.min(5, rating));
  
  // Format the date
  const formatReviewDate = (date: Date) => format(date, "MMM d, yyyy");
  
  // Generate stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < safeRating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AppCard className={className}>
      <AppCardBody>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-catchup-primary/10">
                  <User className="h-5 w-5 text-catchup-primary" />
                </div>
              )}
              <div>
                <h4 className="font-medium text-catchup-primary">{authorName}</h4>
                {serviceName && (
                  <p className="text-xs text-catchup-text-secondary">
                    for {serviceName}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div>{renderStars(safeRating)}</div>
              <div className="flex items-center text-xs text-catchup-text-secondary mt-1">
                <CalendarDays className="mr-1 h-3 w-3" />
                <span>{formatReviewDate(date)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-catchup-text-secondary">
            <p className="italic">{review}</p>
          </div>
        </div>
      </AppCardBody>
    </AppCard>
  );
}