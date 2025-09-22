import { cn } from "@/lib/utils";
import { templateCategories } from "@/data/templates";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl backdrop-blur-sm">
      <button
        onClick={() => onCategoryChange('all')}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
          "hover:scale-105 active:scale-95",
          activeCategory === 'all'
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
      >
        ✨ All Templates
      </button>
      {templateCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
            "hover:scale-105 active:scale-95",
            activeCategory === category.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <span className="text-base">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
};