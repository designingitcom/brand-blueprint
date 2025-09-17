export default function TestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold">🎨 BrandBlueprint Test Page</h1>
      <p className="text-muted-foreground mt-4">
        This is a basic test to verify the app is working.
      </p>
      <div className="mt-8 p-4 bg-card border border-border rounded-lg">
        <p>
          If you can see this page with dark theme styling, the core setup is
          working!
        </p>
      </div>
    </div>
  );
}
