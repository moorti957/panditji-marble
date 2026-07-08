// frontend/src/components/ui/Tabs.tsx

'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

// ============================================================
// Tabs Root
// ============================================================
const Tabs = TabsPrimitive.Root;

// ============================================================
// TabsList
// ============================================================
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-2 text-brown-light dark:text-ivory/60',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

// ============================================================
// TabsTrigger
// ============================================================
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 border-transparent transition-all disabled:pointer-events-none disabled:opacity-50 text-brown-light dark:text-ivory/60 hover:text-brown dark:hover:text-ivory data-[state=active]:text-gold-dark dark:data-[state=active]:text-gold data-[state=active]:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

// ============================================================
// TabsContent
// ============================================================
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'focus-visible:outline-none',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

// ============================================================
// Exports
// ============================================================
export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
