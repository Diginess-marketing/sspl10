import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardGrid } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CardTestDemo = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Sporty Card Styling Demo</h1>

      {/* Default Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Default Cards</h2>
        <CardGrid variant="3">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>This is a standard card with sporty styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content goes here. This card has rounded corners, sport-themed shadows, and hover effects.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
              <CardDescription>Testing the hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Hover over this card to see the lift effect and accent stripe animation.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third Card</CardTitle>
              <CardDescription>Responsive design test</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This grid will adapt to different screen sizes automatically.</p>
            </CardContent>
          </Card>
        </CardGrid>
      </section>

      {/* Stats Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Stats Cards</h2>
        <CardGrid variant="stats">
          <Card variant="stats">
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sport-orange">1,234</div>
              <p className="text-sm text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card variant="stats">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sport-teal">₹45,678</div>
              <p className="text-sm text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card variant="stats">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sport-green">89</div>
              <p className="text-sm text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card variant="stats">
            <CardHeader>
              <CardTitle>Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sport-gold">3.2%</div>
              <p className="text-sm text-muted-foreground">+0.5% improvement</p>
            </CardContent>
          </Card>
        </CardGrid>
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Feature Cards</h2>
        <CardGrid variant="2">
          <Card variant="team">
            <CardHeader>
              <CardTitle>Premium Features</CardTitle>
              <CardDescription>Enhanced functionality for power users</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>• Advanced analytics</li>
                <li>• Custom reporting</li>
                <li>• Priority support</li>
                <li>• API access</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upgrade Now</Button>
            </CardFooter>
          </Card>

          <Card variant="team">
            <CardHeader>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>Work together seamlessly</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>• Real-time collaboration</li>
                <li>• Shared workspaces</li>
                <li>• Team permissions</li>
                <li>• Activity tracking</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Learn More</Button>
            </CardFooter>
          </Card>
        </CardGrid>
      </section>

      {/* Info Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Info Cards</h2>
        <CardGrid variant="4">
          <Card variant="news">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Learn the basics and get up and running quickly with our comprehensive guides.</p>
            </CardContent>
          </Card>

          <Card variant="news">
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Discover tips and tricks to maximize your productivity and achieve better results.</p>
            </CardContent>
          </Card>

          <Card variant="news">
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Get help when you need it. Our support team is here to assist you 24/7.</p>
            </CardContent>
          </Card>

          <Card variant="news">
            <CardHeader>
              <CardTitle>Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Join thousands of users in our community forums and share experiences.</p>
            </CardContent>
          </Card>
        </CardGrid>
      </section>

      {/* Single Column Layout */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Single Column Layout</h2>
        <CardGrid variant="1">
          <Card variant="team">
            <CardHeader>
              <CardTitle>Featured Content</CardTitle>
              <CardDescription>This card takes full width in a single column layout</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This layout is perfect for showcasing important content or when you want to emphasize a particular card. The responsive design ensures it looks great on all devices.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Take Action</Button>
            </CardFooter>
          </Card>
        </CardGrid>
      </section>
    </div>
  );
};

export default CardTestDemo;