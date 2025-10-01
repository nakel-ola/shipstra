import { motion } from "framer-motion";
import {
  ActivityFilters,
  ActivityTimeline,
  ActivityEmptyState,
} from "./features";
import { useActivity } from "@/hooks/use-activity";

export default function Activity() {
  const { activities, loading, hasMore, loadMore, filters, setFilters } =
    useActivity();

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
          Activity
        </h1>
        <p className="text-lg text-muted-foreground">
          Track all actions and changes across your workspace
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ActivityFilters filters={filters} onFiltersChange={setFilters} />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activities.length === 0 ? (
          <ActivityEmptyState />
        ) : (
          <ActivityTimeline
            activities={activities}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={loadMore}
          />
        )}
      </motion.div>
    </div>
  );
}
