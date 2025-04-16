import * as TabsPrimitive from '@radix-ui/react-tabs';

export function Tabs({ children, className, ...props }) {
  return <TabsPrimitive.Root className={className} {...props}>{children}</TabsPrimitive.Root>;
}

export function TabsList({ children, className, ...props }) {
  return <TabsPrimitive.List className={`flex gap-2 mb-4 ${className}`} {...props}>{children}</TabsPrimitive.List>;
}

export function TabsTrigger({ children, className, ...props }) {
  return <TabsPrimitive.Trigger className={`px-4 py-2 bg-gray-100 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white ${className}`} {...props}>{children}</TabsPrimitive.Trigger>;
}

export function TabsContent({ children, className, ...props }) {
  return <TabsPrimitive.Content className={className} {...props}>{children}</TabsPrimitive.Content>;
}
