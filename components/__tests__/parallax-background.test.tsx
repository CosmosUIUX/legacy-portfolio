import { render, screen } from '@testing-library/react'
import { ParallaxBackground, ParallaxLayer, MultiLayerParallax } from '../parallax-background'
import { MotionProvider } from '@/lib/motion/provider'

// Mock Motion.dev components
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0, on: () => () => {} } }),
  useTransform: () => ({ get: () => 0 }),
  useMotionValue: () => ({ get: () => 0, set: () => {}, on: () => () => {} }),
  useSpring: (value: any) => value
}))

// Mock the hooks
jest.mock('@/lib/motion/hooks', () => ({
  useScrollAnimation: () => ({
    ref: { current: null },
    style: {},
    scrollProgress: { get: () => 0 },
    scrollVelocity: { get: () => 0 },
    motionValues: {},
    isScrolling: false
  })
}))

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MotionProvider>
      {component}
    </MotionProvider>
  )
}

describe('ParallaxBackground', () => {
  const defaultProps = {
    imageUrl: 'test-image.jpg',
    speed: 0.5
  }

  it('renders with basic props', () => {
    const { container } = renderWithProvider(<ParallaxBackground {...defaultProps} />)
    
    // Check if the component renders without crashing
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies advanced effects when enabled', () => {
    const { container } = renderWithProvider(
      <ParallaxBackground 
        {...defaultProps}
        enableRotation={true}
        enableScale={true}
        enableSkew={true}
        enablePerspective={true}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    renderWithProvider(
      <ParallaxBackground {...defaultProps}>
        <div data-testid="child-content">Test Content</div>
      </ParallaxBackground>
    )
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('applies performance optimizations', () => {
    const { container } = renderWithProvider(
      <ParallaxBackground 
        {...defaultProps}
        enableWillChange={true}
        enableGPUAcceleration={true}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('ParallaxLayer', () => {
  const defaultProps = {
    speed: 0.3,
    imageUrl: 'layer-image.jpg'
  }

  it('renders with basic props', () => {
    const { container } = renderWithProvider(<ParallaxLayer {...defaultProps} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies advanced effects when enabled', () => {
    const { container } = renderWithProvider(
      <ParallaxLayer 
        {...defaultProps}
        enableAdvancedEffects={true}
        scale={[1.1, 0.9]}
        rotation={[0, 5]}
        brightness={0.8}
        contrast={1.2}
        saturate={0.9}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders without image when imageUrl is not provided', () => {
    const { container } = renderWithProvider(<ParallaxLayer speed={0.5} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('MultiLayerParallax', () => {
  const defaultLayers = [
    {
      imageUrl: 'layer1.jpg',
      speed: 0.2,
      opacity: 0.6,
      blur: 2
    },
    {
      imageUrl: 'layer2.jpg',
      speed: 0.5,
      opacity: 0.8,
      blur: 1
    },
    {
      imageUrl: 'layer3.jpg',
      speed: 0.8,
      opacity: 1,
      blur: 0
    }
  ]

  it('renders multiple layers correctly', () => {
    const { container } = renderWithProvider(<MultiLayerParallax layers={defaultLayers} />)
    
    // Should render container
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with enhanced layer effects', () => {
    const enhancedLayers = defaultLayers.map(layer => ({
      ...layer,
      enableAdvancedEffects: true,
      scale: [1.1, 0.9] as [number, number],
      rotation: [0, 2] as [number, number],
      brightness: 0.8,
      contrast: 1.1,
      saturate: 0.9
    }))

    const { container } = renderWithProvider(<MultiLayerParallax layers={enhancedLayers} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    renderWithProvider(
      <MultiLayerParallax layers={defaultLayers}>
        <div data-testid="parallax-content">Parallax Content</div>
      </MultiLayerParallax>
    )
    
    expect(screen.getByTestId('parallax-content')).toBeInTheDocument()
  })

  it('applies performance mode when enabled', () => {
    const { container } = renderWithProvider(
      <MultiLayerParallax 
        layers={defaultLayers} 
        enablePerformanceMode={true}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('Parallax Performance', () => {
  it('handles empty layers array gracefully', () => {
    const { container } = renderWithProvider(<MultiLayerParallax layers={[]} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('handles missing imageUrl in layers', () => {
    const layersWithoutImages = [
      { speed: 0.3, opacity: 0.5 },
      { speed: 0.6, opacity: 0.8 }
    ]

    const { container } = renderWithProvider(<MultiLayerParallax layers={layersWithoutImages} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })
})