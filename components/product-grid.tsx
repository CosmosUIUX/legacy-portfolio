"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { ProductCard } from "./product-card";
import { useStaggerAnimation } from "@/lib/motion/hooks";
import {
  ANIMATION_PRESETS,
  EASING_PRESETS,
  DURATION_PRESETS,
} from "@/lib/motion/config";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  onQuickLook: (product: Product) => void;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: number;
  animationPreset?: "subtle" | "dynamic" | "cinematic";
  enableFiltering?: boolean;
  enableSorting?: boolean;
  loadingCount?: number;
  isLoading?: boolean;
}

type SortOption = "name" | "price" | "newest" | "popular";
type FilterOption = "all" | "new" | "popular" | "featured" | "limited";

export function ProductGrid({
  products,
  onQuickLook,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 8,
  animationPreset = "dynamic",
  enableFiltering = false,
  enableSorting = false,
  loadingCount = 6,
  isLoading = false,
}: ProductGridProps) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [layoutKey, setLayoutKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousProducts, setPreviousProducts] = useState<Product[]>([]);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let filtered = products;

    // Apply filter
    if (filter !== "all") {
      filtered = products.filter((product) => {
        switch (filter) {
          case "new":
            return product.badge === "New";
          case "popular":
            return product.badge === "Popular";
          case "featured":
            return product.badge === "Featured";
          case "limited":
            return product.badge === "Limited";
          default:
            return true;
        }
      });
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          // Extract numeric value from price string for comparison
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""));
          return priceA - priceB;
        case "popular":
          // Prioritize popular items
          if (a.badge === "Popular" && b.badge !== "Popular") return -1;
          if (b.badge === "Popular" && a.badge !== "Popular") return 1;
          return 0;
        case "newest":
        default:
          // Prioritize new items
          if (a.badge === "New" && b.badge !== "New") return -1;
          if (b.badge === "New" && a.badge !== "New") return 1;
          return 0;
      }
    });

    return sorted;
  }, [products, filter, sort]);

  // Enhanced stagger animation for grid items with viewport optimization
  const staggerAnimation = useStaggerAnimation({
    items: processedProducts,
    staggerDelay: (index: number) => {
      // Dynamic stagger delay based on animation preset and grid position
      const baseDelay =
        animationPreset === "cinematic"
          ? 150
          : animationPreset === "subtle"
            ? 80
            : 100;

      // Optimize for large collections by reducing delay
      const optimizedDelay =
        processedProducts.length > 12 ? baseDelay * 0.6 : baseDelay;

      // Calculate row-based stagger for grid layout
      const itemsPerRow = columns.desktop;
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;

      // Stagger by row first, then add slight column offset
      return row * optimizedDelay + col * (optimizedDelay * 0.2);
    },
    animationPreset: "staggerFadeIn",
    trigger: "viewport",
    direction: "forward",
    onItemStart: (index) => {
      // Performance optimization: limit concurrent animations
      if (processedProducts.length > 20 && index > 8) {
        // For large collections, only animate first 8 items with full effect
        return;
      }
    },
  });

  // Enhanced filter change with smooth layout transitions
  const handleFilterChange = useCallback(
    (newFilter: FilterOption) => {
      if (newFilter === filter) return;

      setIsTransitioning(true);
      setPreviousProducts([...processedProducts]);

      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Animate out current items before changing filter
      setLayoutKey((prev) => prev + 1);

      // Apply filter change with optimized timing
      transitionTimeoutRef.current = setTimeout(() => {
        setFilter(newFilter);
        setIsTransitioning(false);
      }, 150);
    },
    [filter, processedProducts],
  );

  // Enhanced sort change with layout animation
  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      if (newSort === sort) return;

      setIsTransitioning(true);
      setPreviousProducts([...processedProducts]);

      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Trigger layout animation for reordering
      setLayoutKey((prev) => prev + 1);

      // Apply sort with optimized timing for smooth reordering
      transitionTimeoutRef.current = setTimeout(() => {
        setSort(newSort);
        setIsTransitioning(false);
      }, 100);
    },
    [sort, processedProducts],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Generate loading skeleton items
  const loadingItems = useMemo(
    () =>
      Array.from({ length: loadingCount }, (_, i) => ({
        id: `loading-${i}`,
        name: "",
        price: "",
        image: "",
        materials: [],
        swatches: [],
        quickLookImages: [],
        dimensions: "",
      })),
    [loadingCount],
  );

  // Enhanced grid classes with performance optimizations
  const gridClasses = useMemo(() => {
    const baseClasses = `grid gap-${gap} grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;

    // Add performance optimizations for large collections
    const performanceClasses =
      processedProducts.length > 20
        ? "transform-gpu"
        : "";

    return `${baseClasses} ${performanceClasses}`;
  }, [gap, columns, processedProducts.length]);

  // Memoized transition state for performance
  const transitionState = useMemo(
    () => ({
      isTransitioning,
      hasProducts: processedProducts.length > 0,
      isLargeCollection: processedProducts.length > 20,
      shouldOptimize: processedProducts.length > 50,
    }),
    [isTransitioning, processedProducts.length],
  );

  return (
    <div className="w-full">
      {/* Filter and Sort Controls */}
      {(enableFiltering || enableSorting) && (
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {enableFiltering && (
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter by:
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "all",
                    "new",
                    "popular",
                    "featured",
                    "limited",
                  ] as FilterOption[]
                ).map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => handleFilterChange(option)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === option
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {enableSorting && (
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Sort by:
              </label>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name (A-Z)</option>
                <option value="price">Price (Low to High)</option>
              </select>
            </div>
          )}
        </motion.div>
      )}

      {/* Transition Overlay for Smooth View Changes */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex items-center gap-2 text-gray-600"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-sm font-medium">Updating view...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Product Grid with Advanced Layout Animations */}
      <motion.div
        ref={staggerAnimation.ref}
        className={`relative ${gridClasses}`}
        layout
        key={layoutKey}
        {...staggerAnimation.eventHandlers}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isTransitioning ? 0.7 : 1,
          filter: isTransitioning ? "blur(1px)" : "blur(0px)",
        }}
        transition={{
          duration: 0.3,
          opacity: { duration: 0.2 },
          filter: { duration: 0.2 },
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isLoading
            ? // Enhanced loading state with optimized animations
              loadingItems.map((_, index) => (
                <motion.div
                  key={`loading-${index}`}
                  layout
                  layoutId={`loading-${index}`}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    y: -10,
                    transition: { duration: 0.2 },
                  }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.08, 0.8), // Cap delay for large collections
                    ease: [0.4, 0, 0.2, 1],
                    layout: {
                      duration: 0.5,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    },
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                >
                  <ProductCard
                    product={{
                      id: `loading-${index}`,
                      name: "",
                      price: "",
                      image: "",
                      materials: [],
                      swatches: [],
                      quickLookImages: [],
                      dimensions: "",
                    }}
                    onQuickLook={() => {}}
                    isLoading={true}
                    animationPreset={animationPreset}
                  />
                </motion.div>
              ))
            : // Enhanced product cards with advanced layout animations
              processedProducts.map((product, index) => {
                // Calculate optimized animation properties based on collection size
                const isLargeCollection = processedProducts.length > 20;
                const shouldReduceAnimations = isLargeCollection && index > 12;

                const entranceDelay = shouldReduceAnimations
                  ? 0
                  : Math.min(
                      index * (animationPreset === "cinematic" ? 0.15 : 0.1),
                      1.2,
                    );

                const entranceDuration = shouldReduceAnimations
                  ? 0.2
                  : animationPreset === "cinematic"
                    ? 0.8
                    : animationPreset === "subtle"
                      ? 0.3
                      : 0.5;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    layoutId={`product-${product.id}`}
                    {...(!shouldReduceAnimations
                      ? staggerAnimation.getItemProps(index)
                      : {})}
                    initial={{
                      opacity: 0,
                      scale: 0.85,
                      y: animationPreset === "cinematic" ? 40 : 20,
                      rotateX: animationPreset === "cinematic" ? 15 : 0,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotateX: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      y: -20,
                      rotateX: animationPreset === "cinematic" ? -10 : 0,
                      transition: {
                        duration: 0.3,
                        ease: EASING_PRESETS.fast,
                      },
                    }}
                    whileHover={{
                      scale: animationPreset === "subtle" ? 1.02 : 1.05,
                      y: animationPreset === "subtle" ? -2 : -8,
                      rotateX: animationPreset === "cinematic" ? 5 : 0,
                      transition: {
                        duration: 0.3,
                        ease: EASING_PRESETS.snappy,
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      },
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                    transition={{
                      duration: entranceDuration,
                      delay: entranceDelay,
                      ease:
                        animationPreset === "cinematic"
                          ? EASING_PRESETS.cinematic
                          : EASING_PRESETS.smooth,
                      layout: {
                        duration: 0.5,
                        ease: EASING_PRESETS.smooth,
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      },
                    }}
                    // Performance optimization: reduce transform calculations for large collections
                    style={{
                      transformOrigin: "center center",
                      backfaceVisibility: "hidden",
                      willChange: shouldReduceAnimations
                        ? "auto"
                        : "transform, opacity",
                    }}
                  >
                    <ProductCard
                      product={product}
                      onQuickLook={onQuickLook}
                      layoutId={`product-card-${product.id}`}
                      animationPreset={animationPreset}
                    />
                  </motion.div>
                );
              })}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced Empty State with Better UX */}
      <AnimatePresence>
        {!isLoading && !isTransitioning && processedProducts.length === 0 && (
          <motion.div
            className="text-center py-16 px-4"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.4,
                type: "spring",
                stiffness: 300,
              }}
            >
              <motion.div
                className="w-8 h-8 border-2 border-gray-300 rounded-lg"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            <motion.div
              className="text-gray-500 text-lg mb-2 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              No products found
            </motion.div>

            <motion.div
              className="text-gray-400 text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {filter !== "all"
                ? `No products match the "${filter}" filter`
                : "Try adjusting your filters or check back later"}
            </motion.div>

            {/* Reset filters button if filter is active */}
            {filter !== "all" && enableFiltering && (
              <motion.button
                onClick={() => handleFilterChange("all")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Show All Products
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid performance info (development only) */}
      {process.env.NODE_ENV === "development" && (
        <motion.div
          className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Showing {processedProducts.length} of {products.length} products
          {filter !== "all" && ` (filtered by: ${filter})`}
          {sort !== "newest" && ` (sorted by: ${sort})`}
        </motion.div>
      )}
    </div>
  );
}

// Enhanced grid with preset configurations
export function ProductGridPresets() {
  return {
    // Minimal grid for showcasing few products
    minimal: {
      columns: { mobile: 1, tablet: 2, desktop: 2 },
      gap: 12,
      animationPreset: "cinematic" as const,
      enableFiltering: false,
      enableSorting: false,
    },

    // Standard grid for product catalogs
    standard: {
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      gap: 8,
      animationPreset: "dynamic" as const,
      enableFiltering: true,
      enableSorting: true,
    },

    // Dense grid for large collections
    dense: {
      columns: { mobile: 2, tablet: 3, desktop: 4 },
      gap: 6,
      animationPreset: "subtle" as const,
      enableFiltering: true,
      enableSorting: true,
    },

    // Gallery grid for featured items
    gallery: {
      columns: { mobile: 1, tablet: 1, desktop: 2 },
      gap: 16,
      animationPreset: "cinematic" as const,
      enableFiltering: false,
      enableSorting: false,
    },
  };
}

// Hook for managing grid state
export function useProductGrid(initialProducts: Product[]) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product]);
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const updateProduct = useCallback(
    (productId: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
      );
    },
    [],
  );

  const loadProducts = useCallback(async (loader: () => Promise<Product[]>) => {
    setIsLoading(true);
    try {
      const newProducts = await loader();
      setProducts(newProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    isLoading,
    addProduct,
    removeProduct,
    updateProduct,
    loadProducts,
    setProducts,
  };
}
