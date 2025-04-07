import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MODELS } from "@/lib/constants"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Create stunning images with AI</h1>
              <p className="text-xl text-muted-foreground">
                Transform your ideas into beautiful visuals with our advanced AI image generation models.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-native hover:bg-native-dark">
                  <Link href="/playground">Start Creating</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/gallery">View Gallery</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/diffusion.jpeg?height=400&width=400"
                  alt="AI generated image"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/mountains.png?height=400&width=400"
                  alt="AI generated image"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/skeleton.png?height=400&width=400"
                  alt="AI generated image"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/coral.jpeg?height=400&width=400"
                  alt="AI generated image"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Model</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select from our range of specialized AI models to create the perfect image for your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODELS.map((model) => (
              <div
                key={model.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:border-native transition-all"
              >
                <div className="text-3xl mb-4">{model.icon}</div>
                <h3 className="text-xl font-bold mb-2">{model.name}</h3>
                <p className="text-muted-foreground mb-4">{model.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{model.creditCost} credits per image</span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/playground">Try Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-native text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to create amazing images?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Sign up today and get 16 free credits to start generating stunning visuals with our AI models.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

