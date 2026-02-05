import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSettings } from "@/contexts/SettingsContext";

interface CategoryHeaderProps {
  category: string;
}

const CategoryHeader = ({ category }: CategoryHeaderProps) => {
  const { language, t } = useSettings();
  
  return (
    <section className="w-full px-6 mb-8">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('general.home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extralight tracking-wide text-foreground mb-2">
          {category}
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          {language === 'bn' 
            ? 'আমাদের প্রিমিয়াম সংগ্রহ অন্বেষণ করুন' 
            : 'Explore our premium collection'}
        </p>
      </div>
    </section>
  );
};

export default CategoryHeader;
