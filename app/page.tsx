import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-accent/10">
              <span className="text-sm font-semibold text-accent">Welcome to CivicChain</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-pretty">
              Verify, Pay, and Build Trust on the Blockchain
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              A decentralized civic payment and verification platform powered by Cardano blockchain and Atala PRISM
              digital identities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Digital ID (Atala PRISM)",
                description: "Create and manage verifiable decentralized identities on Cardano",
                icon: "🆔",
              },
              {
                title: "Secure Cardano Payments",
                description: "Fast and secure payment processing on the Cardano blockchain",
                icon: "💳",
              },
              {
                title: "Transparent Verification",
                description: "Immutable verification records and audit trails",
                icon: "✓",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border/40 bg-card hover:bg-card/80 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
