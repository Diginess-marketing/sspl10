import React from "react"
import { Badge, LiveBadge, NumericBadge } from "@/components/ui/badge"
import { Label, CategoryLabel, TagLabel, StatusLabel, PriorityLabel } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

/**
 * Comprehensive showcase of Badge and Label components
 * Demonstrates all variants, sizes, and features according to the design system
 */
export function BadgeLabelShowcase() {
  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-sport-green">Badge & Label System</h1>
        <p className="text-muted-foreground">
          Comprehensive showcase of the SSPLT10 badge and label components
        </p>
      </div>

      {/* Badge Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Components</CardTitle>
          <CardDescription>
            Status badges, animated badges, and numeric badges with design system colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="live">Live</Badge>
              <Badge variant="upcoming">Upcoming</Badge>
              <Badge variant="completed">Completed</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <Separator />

          {/* Size Variants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Size Variants</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-12">XS:</span>
                <Badge variant="live" size="xs">Live</Badge>
                <Badge variant="success" size="xs">Success</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-12">SM:</span>
                <Badge variant="live" size="sm">Live</Badge>
                <Badge variant="success" size="sm">Success</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-12">Default:</span>
                <Badge variant="live">Live</Badge>
                <Badge variant="success">Success</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-12">LG:</span>
                <Badge variant="live" size="lg">Live</Badge>
                <Badge variant="success" size="lg">Success</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Animated Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Animated Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="live" animated>Live Stream</Badge>
              <LiveBadge>Live Match</LiveBadge>
              <LiveBadge size="lg">Live Event</LiveBadge>
            </div>
          </div>

          <Separator />

          {/* Numeric Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Numeric Badges</h3>
            <div className="flex flex-wrap gap-3">
              <NumericBadge count={0} />
              <NumericBadge count={5} />
              <NumericBadge count={25} />
              <NumericBadge count={99} />
              <NumericBadge count={150} />
              <NumericBadge count={150} maxCount={99} />
            </div>
          </div>

          <Separator />

          {/* Notification Badges with Dots */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="info" showDot>Messages</Badge>
              <Badge variant="warning" count={0} showDot>Updates</Badge>
              <Badge variant="error" count={3} showDot>Alerts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Label Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Label Components</CardTitle>
          <CardDescription>
            Category labels, tags, status labels, and priority indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Labels */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Category Labels</h3>
            <div className="flex flex-wrap gap-3">
              <CategoryLabel>General</CategoryLabel>
              <Label variant="category-sports">Sports</Label>
              <Label variant="category-news">News</Label>
              <Label variant="category-events">Events</Label>
            </div>
          </div>

          <Separator />

          {/* Tag Labels */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status Labels</h3>
            <div className="flex flex-wrap gap-3">
              <Label variant="status-active">Active</Label>
              <Label variant="status-inactive">Inactive</Label>
              <Label variant="status-pending">Pending</Label>
              <Label variant="status-draft">Draft</Label>
            </div>
          </div>

          <Separator />

          {/* Priority Labels */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Priority Labels</h3>
            <div className="flex flex-wrap gap-3">
              <Label variant="priority-low">Low</Label>
              <Label variant="priority-medium">Medium</Label>
              <Label variant="priority-high">High</Label>
              <Label variant="priority-urgent">Urgent</Label>
            </div>
          </div>

          <Separator />

          {/* Labels with Icons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Labels with Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Label startIcon={<span>🏏</span>}>Cricket</Label>
              <Label startIcon={<span>⚡</span>} variant="category-sports">
                Live Match
              </Label>
              <Label endIcon={<span>→</span>} variant="tag-primary">
                Featured
              </Label>
              <Label
                startIcon={<span>⭐</span>}
                endIcon={<span>×</span>}
                variant="priority-high"
                removable
                onRemove={() => console.log('Remove')}
              >
                High Priority
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Common usage patterns and code examples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Live Content Indicator</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`<LiveBadge>Live Stream</LiveBadge>
<Badge variant="live" animated>Live Match</Badge>`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Counter</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`<NumericBadge count={5} />
<Badge variant="numeric" count={99} maxCount={99} />`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Categorization</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`<CategoryLabel variant="category-sports">Match Report</CategoryLabel>
<TagLabel removable onRemove={handleRemove}>Cricket</TagLabel>`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status Management</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`<StatusLabel variant="status-active">Published</StatusLabel>
<PriorityLabel variant="priority-high">Urgent</PriorityLabel>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}