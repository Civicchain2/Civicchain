import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/40 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-accent">CivicChain</h3>
            <p className="text-sm text-muted-foreground">
              Decentralized civic payment and verification platform powered by Cardano blockchain.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CivicChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
