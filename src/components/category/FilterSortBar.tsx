import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/contexts/SettingsContext";

export interface FilterState {
  categories: string[];
  priceRange: string | null;
  skinType: string | null;
}

interface FilterSortBarProps {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  itemCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FilterSortBar = ({ 
  filtersOpen, 
  setFiltersOpen, 
  itemCount, 
  sortBy, 
  onSortChange,
  filters,
  onFiltersChange,
}: FilterSortBarProps) => {
  const { data: categories } = useCategories();
  const { language } = useSettings();
  const navigate = useNavigate();

  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const priceRanges = [
    { label: language === 'bn' ? '৳০ - ৳৫০০' : 'Under ৳500', value: '0-500' },
    { label: language === 'bn' ? '৳৫০০ - ৳১,০০০' : '৳500 - ৳1,000', value: '500-1000' },
    { label: language === 'bn' ? '৳১,০০০ - ৳২,০০০' : '৳1,000 - ৳2,000', value: '1000-2000' },
    { label: language === 'bn' ? '৳২,০০০+' : 'Over ৳2,000', value: '2000+' },
  ];

  const skinTypes = [
    { label: language === 'bn' ? 'সব ধরনের ত্বক' : 'All Skin Types', value: 'All Skin Types' },
    { label: language === 'bn' ? 'শুষ্ক' : 'Dry', value: 'Dry' },
    { label: language === 'bn' ? 'তৈলাক্ত' : 'Oily', value: 'Oily' },
    { label: language === 'bn' ? 'মিশ্র' : 'Combination', value: 'Combination' },
    { label: language === 'bn' ? 'সংবেদনশীল' : 'Sensitive', value: 'Sensitive' },
    { label: language === 'bn' ? 'স্বাভাবিক' : 'Normal', value: 'Normal' },
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setTempFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handlePriceToggle = (value: string) => {
    setTempFilters(prev => ({
      ...prev,
      priceRange: prev.priceRange === value ? null : value
    }));
  };

  const handleSkinTypeToggle = (value: string) => {
    setTempFilters(prev => ({
      ...prev,
      skinType: prev.skinType === value ? null : value
    }));
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      priceRange: null,
      skinType: null,
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = 
    tempFilters.categories.length + 
    (tempFilters.priceRange ? 1 : 0) + 
    (tempFilters.skinType ? 1 : 0);

  return (
    <>
      <section className="w-full px-6 mb-8 border-b border-border pb-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-light text-muted-foreground">
            {itemCount} {language === 'bn' ? 'পণ্য' : 'items'}
          </p>
          
          <div className="flex items-center gap-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="font-light hover:bg-transparent"
                >
                  {language === 'bn' ? 'ফিল্টার' : 'Filters'}
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background border-l border-border">
                <SheetHeader className="mb-6 border-b border-border pb-4">
                  <SheetTitle className="text-lg font-light">
                    {language === 'bn' ? 'ফিল্টার' : 'Filters'}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="space-y-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">
                      {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                    </h3>
                    <div className="space-y-3">
                      {categories?.filter(c => c.is_active).map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-3">
                          <Checkbox 
                            id={`cat-${cat.id}`}
                            checked={tempFilters.categories.includes(cat.id)}
                            onCheckedChange={() => handleCategoryToggle(cat.id)}
                            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground" 
                          />
                          <Label 
                            htmlFor={`cat-${cat.id}`} 
                            className="text-sm font-light text-foreground cursor-pointer"
                          >
                            {cat.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  {/* Price Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">
                      {language === 'bn' ? 'মূল্য' : 'Price'}
                    </h3>
                    <div className="space-y-3">
                      {priceRanges.map((range) => (
                        <div key={range.value} className="flex items-center space-x-3">
                          <Checkbox 
                            id={`price-${range.value}`}
                            checked={tempFilters.priceRange === range.value}
                            onCheckedChange={() => handlePriceToggle(range.value)}
                            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground" 
                          />
                          <Label 
                            htmlFor={`price-${range.value}`} 
                            className="text-sm font-light text-foreground cursor-pointer"
                          >
                            {range.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  {/* Skin Type Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">
                      {language === 'bn' ? 'ত্বকের ধরন' : 'Skin Type'}
                    </h3>
                    <div className="space-y-3">
                      {skinTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-3">
                          <Checkbox 
                            id={`skin-${type.value}`}
                            checked={tempFilters.skinType === type.value}
                            onCheckedChange={() => handleSkinTypeToggle(type.value)}
                            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground" 
                          />
                          <Label 
                            htmlFor={`skin-${type.value}`} 
                            className="text-sm font-light text-foreground cursor-pointer"
                          >
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  <div className="flex flex-col gap-2 pt-4 sticky bottom-0 bg-background pb-4">
                    <Button 
                      onClick={applyFilters}
                      className="w-full"
                    >
                      {language === 'bn' ? 'ফিল্টার প্রয়োগ করুন' : 'Apply Filters'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="w-full border-none hover:bg-transparent hover:underline font-light"
                    >
                      {language === 'bn' ? 'সব মুছুন' : 'Clear All'}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-auto border-none bg-transparent text-sm font-light shadow-none rounded-none pr-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border border-border rounded-none bg-background">
                <SelectItem value="featured" className="hover:bg-muted data-[state=checked]:bg-muted pl-2 [&>span:first-child]:hidden">
                  {language === 'bn' ? 'বৈশিষ্ট্যযুক্ত' : 'Featured'}
                </SelectItem>
                <SelectItem value="price-low" className="hover:bg-muted data-[state=checked]:bg-muted pl-2 [&>span:first-child]:hidden">
                  {language === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}
                </SelectItem>
                <SelectItem value="price-high" className="hover:bg-muted data-[state=checked]:bg-muted pl-2 [&>span:first-child]:hidden">
                  {language === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}
                </SelectItem>
                <SelectItem value="newest" className="hover:bg-muted data-[state=checked]:bg-muted pl-2 [&>span:first-child]:hidden">
                  {language === 'bn' ? 'নতুন' : 'Newest'}
                </SelectItem>
                <SelectItem value="name" className="hover:bg-muted data-[state=checked]:bg-muted pl-2 [&>span:first-child]:hidden">
                  {language === 'bn' ? 'নাম অ-ক' : 'Name A-Z'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </>
  );
};

export default FilterSortBar;
