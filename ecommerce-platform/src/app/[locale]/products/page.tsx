import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsContent } from "./products-content";

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen">
          <div className="bg-muted/30 border-b">
            <div className="container mx-auto px-4 py-3">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}