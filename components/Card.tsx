'use client'

/* eslint-disable react/no-unescaped-entities */


import { useEffect, useState, useCallback, useMemo } from 'react'
import { Search, Menu, X, BarChart3, Download, Copy, Shuffle, AlertTriangle, CheckCircle, XCircle, Loader2, Plus, Minus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie } from 'recharts'

const ALL_KEYWORDS = [
  'DASH',
  'LEAP',
  'STALKER',
  'RECLUSE',
  'CHEAPSHOT',
  'REACH',
  'OVERRUN',
  'IMMORTAL',
  'ATTACH',
]

type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

type CardData = {
  name: string
  type?: string
  subtype?: string
  tape_cost?: number
  aura?: string
  rarity?: string
  attack?: number
  health?: number
  flavor_text?: string
  effect?: string
  imageUrl?: string
  expansion?: string
  keywords?: string[] | string
  artist?: string
  id?: string
  category?: string
}

type Filters = {
  name: string
  type: string
  subtype: string
  expansion: string
  tape_cost: string
  artist: string
  keywords: string[]
  searchText: string
}

type DeckData = {
  main: CardData[]
  tape: CardData[]
  side: CardData[]
  name?: string
  description?: string
  dateCreated?: string
  dateModified?: string
}

type SortOption = 'name' | 'type' | 'tape_cost' | 'attack' | 'health'

// Toast Component
function Toast({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-600 border-emerald-500 text-emerald-50'
      case 'error':
        return 'bg-red-600 border-red-500 text-red-50'
      case 'warning':
        return 'bg-amber-600 border-amber-500 text-amber-50'
      case 'info':
        return 'bg-blue-600 border-blue-500 text-blue-50'
      default:
        return 'bg-slate-600 border-slate-500 text-slate-50'
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={16} />
      case 'error':
        return <XCircle size={16} />
      case 'warning':
        return <AlertTriangle size={16} />
      case 'info':
        return <Search size={16} />
      default:
        return null
    }
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg shadow-lg border ${getToastStyles()} animate-in slide-in-from-right-full duration-300 ease-out`}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-current opacity-70 hover:opacity-100 transition-opacity duration-200"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// Toast Container
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// Skeleton Card Component for Loading States
function SkeletonCard() {
  return (
    <div className="bg-slate-800 p-2 rounded-lg shadow-md border border-slate-600/40 animate-pulse">
      <div className="w-full h-32 bg-slate-300 rounded mb-2"></div>
      <div className="h-3 bg-slate-300 rounded mb-1"></div>
      <div className="h-2 bg-slate-300 rounded w-3/4 mb-1"></div>
      <div className="h-2 bg-slate-300 rounded w-1/2"></div>
    </div>
  )
}

// Loading Grid Component
function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {Array.from({ length: 24 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// Quantity Selector Component
function QuantitySelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 10,
  label = "Quantity"
}: { 
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-300 font-medium">{label}:</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded text-xs transition-all duration-200 hover:scale-110 disabled:transform-none"
        >
          <Minus size={12} />
        </button>
        <span className="w-8 text-center text-sm font-bold text-white bg-slate-700 py-1 rounded">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded text-xs transition-all duration-200 hover:scale-110 disabled:transform-none"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}

// Basic Card component
function Card({ card }: { card: CardData }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  return (
    <div className="bg-slate-800 p-2 rounded-lg border border-slate-600/40 shadow-md hover:shadow-lg transition-all duration-200">
      {card.imageUrl && !imageError && (
        <div className="relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded backdrop-blur-sm">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            </div>
          )}
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-auto rounded mb-2 border border-slate-600/20"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />
        </div>
      )}
      {(imageError || !card.imageUrl) && (
        <div className="w-full h-24 bg-slate-700 rounded mb-2 flex items-center justify-center text-xs text-slate-400 border border-slate-600/30">
          No Image
        </div>
      )}
      <div className="text-xs font-semibold text-white mb-1 leading-tight" style={{ fontSize: card.name.length > 20 ? '10px' : '12px' }}>
        {card.name}
      </div>
      <div className="text-xs text-slate-300 mb-1">
        {card.type}{card.subtype ? ` - ${card.subtype}` : ''}
      </div>
      {card.tape_cost !== undefined && (
        <div className="text-xs text-violet-300 mb-1">
          Cost: <span className="font-medium">{card.tape_cost}</span>
        </div>
      )}
      {(card.attack !== undefined || card.health !== undefined) && (
        <div className="text-xs text-amber-300 mb-1">
          {card.attack !== undefined && <span>ATK: {card.attack}</span>}
          {card.attack !== undefined && card.health !== undefined && ' / '}
          {card.health !== undefined && <span>HP: {card.health}</span>}
        </div>
      )}
    </div>
  )
}

function CardGridItem({
  card,
  onAddToDeck,
  onPreview,
  onHover,
}: {
  card: CardData
  onAddToDeck: (card: CardData, deck: 'main' | 'tape' | 'side') => void
  onPreview: (card: CardData) => void
  onHover: (cardName: string | null) => void
}) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [buttonPressed, setButtonPressed] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('application/json', JSON.stringify(card))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleAddToDeck = (targetDeck: 'main' | 'tape' | 'side') => {
    setIsAnimating(true)
    onAddToDeck(card, targetDeck)
    
    // Reset animation after a short delay
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md relative cursor-grab active:cursor-grabbing transition-all duration-300 ease-out group border border-slate-300 ${
        isDragging ? 'opacity-50 scale-95 rotate-2' : ''
      } ${
        isAnimating ? 'animate-pulse scale-95' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => onHover(card.name)}
      onMouseLeave={() => onHover(null)}
      onContextMenu={(e) => {
        e.preventDefault()
        onPreview(card)
      }}
      style={{
        transform: isDragging ? 'rotate(5deg) scale(0.95)' : '',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Card Image */}
      <div className="relative">
        {card.imageUrl && !imageError && (
          <div className="relative overflow-hidden rounded-t-lg">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded backdrop-blur-sm z-10">
                <div className="w-4 h-4 border-2 border-purple-800 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-auto rounded-t-lg"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          </div>
        )}
        {(imageError || !card.imageUrl) && (
          <div className="w-full h-32 bg-slate-700 rounded-t-lg flex items-center justify-center text-xs text-slate-400">
            No Image
          </div>
        )}
        
        {/* Action buttons overlay - only on the image area */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-t-lg">
          <div className="flex flex-col gap-1">
            {card.type !== 'Tape' && card.type !== 'Token' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setButtonPressed('main')
                  handleAddToDeck('main')
                  setTimeout(() => setButtonPressed(null), 150)
                }}
                className={`bg-green-600 hover:bg-green-500 active:bg-green-700 text-white rounded px-3 py-1.5 text-xs font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  buttonPressed === 'main' ? 'scale-95 bg-green-700' : ''
                }`}
                title="Add to Main Deck (M)"
              >
                Main
              </button>
            )}
            {card.type === 'Tape' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setButtonPressed('tape')
                  handleAddToDeck('tape')
                  setTimeout(() => setButtonPressed(null), 150)
                }}
                className={`bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded px-3 py-1.5 text-xs font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  buttonPressed === 'tape' ? 'scale-95 bg-emerald-700' : ''
                }`}
                title="Add to Tape Deck (T)"
              >
                Tape
              </button>
            )}
            {card.type !== 'Token' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setButtonPressed('side')
                  handleAddToDeck('side')
                  setTimeout(() => setButtonPressed(null), 150)
                }}
                className={`bg-purple-800 hover:bg-purple-700 active:bg-purple-900 text-white rounded px-3 py-1.5 text-xs font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  buttonPressed === 'side' ? 'scale-95 bg-purple-900' : ''
                }`}
                title="Add to Side Deck (S)"
              >
                Side
              </button>
            )}
          </div>
        </div>
        
        {/* Drag indicator */}
        <div className="absolute top-2 right-2 text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 bg-black/50 rounded px-1">
          <div className="animate-pulse">⋮⋮</div>
        </div>
      </div>

      {/* Card Info - Compact section below image */}
      <div className="p-2">
        <div className="text-xs font-semibold text-purple-800 mb-1 leading-tight" style={{ fontSize: card.name.length > 20 ? '10px' : '12px' }}>
          {card.name}
        </div>
        <div className="text-xs text-purple-700 mb-1">
          {card.type}{card.subtype ? ` - ${card.subtype}` : ''}
        </div>
        {card.tape_cost !== undefined && (
          <div className="text-xs text-purple-600 mb-1">
            Cost: <span className="font-medium">{card.tape_cost}</span>
          </div>
        )}
        {(card.attack !== undefined || card.health !== undefined) && (
          <div className="text-xs text-purple-600">
            {card.attack !== undefined && <span>ATK: {card.attack}</span>}
            {card.attack !== undefined && card.health !== undefined && ' / '}
            {card.health !== undefined && <span>HP: {card.health}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function DeckList({
  title,
  cards,
  onRemove,
  onPreview,
  validation,
  deckType,
  onAddToDeck,
}: {
  title: string
  cards: [string, { card: CardData; count: number }][]
  onRemove: (card: CardData) => void
  onPreview: (card: CardData) => void
  validation: { errors: string[]; warnings: string[]; isValid: boolean }
  deckType: 'main' | 'tape' | 'side'
  onAddToDeck: (card: CardData, deck: 'main' | 'tape' | 'side') => void
}) {
  const [hoveredCard, setHoveredCard] = useState<CardData | null>(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const [isDragOver, setIsDragOver] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const totalCards = cards.reduce((sum, [, { count }]) => sum + count, 0)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only hide if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    try {
      const cardData = JSON.parse(e.dataTransfer.getData('application/json')) as CardData
      onAddToDeck(cardData, deckType)
      
      // Show animation for newly added card
      setJustAdded(cardData.name)
      setTimeout(() => setJustAdded(null), 600)
    } catch (error) {
      console.error('Error parsing dropped card data:', error)
    }
  }

  const getValidationIcon = () => {
    const hasErrors = validation.errors.some(error => error.toLowerCase().includes(deckType))
    const hasWarnings = validation.warnings.some(warning => warning.toLowerCase().includes(deckType))
    
    if (hasErrors) return <XCircle size={16} className="text-red-400 animate-pulse" />
    if (hasWarnings) return <AlertTriangle size={16} className="text-amber-400 animate-bounce" />
    return <CheckCircle size={16} className="text-emerald-400" />
  }

  const getDeckTypeColor = () => {
    switch (deckType) {
      case 'main': return isDragOver ? 'bg-green-500 shadow-green-500/50' : 'bg-green-600'
      case 'tape': return isDragOver ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-emerald-600'
      case 'side': return isDragOver ? 'bg-purple-700 shadow-purple-500/50' : 'bg-purple-800'
      default: return 'bg-slate-600'
    }
  }

  return (
    <div className="mb-6 relative">
      <div 
        className={`flex items-center gap-2 mb-3 p-2 rounded-lg text-white transition-all duration-300 ease-out ${getDeckTypeColor()} ${
          isDragOver ? 'ring-4 ring-white/30 scale-105 shadow-lg transform' : 'hover:scale-[1.02]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h2 className="font-semibold text-sm transition-all duration-200">{title} ({totalCards})</h2>
        <div className="transition-all duration-200">
          {getValidationIcon()}
        </div>
        {isDragOver && (
          <div className="ml-auto text-xs bg-white/20 px-2 py-1 rounded animate-pulse backdrop-blur-sm">
            Drop here!
          </div>
        )}
      </div>
      
      <div 
        className={`space-y-1 transition-all duration-300 ${
          isDragOver ? 'bg-slate-700/30 rounded-lg p-2 border-2 border-dashed border-slate-400 scale-[1.02]' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {cards.map(([name, { card, count }], index) => (
          <div
            key={name}
            className={`flex items-center bg-slate-800 hover:bg-slate-700 transition-all duration-300 border border-slate-600/30 rounded cursor-pointer group transform hover:scale-[1.02] hover:shadow-md ${
              justAdded === name ? 'animate-pulse bg-green-900/50 border-green-400' : ''
            }`}
            style={{
              animationDelay: `${index * 50}ms`,
              animation: justAdded === name ? 'slideInFromRight 0.5s ease-out' : '',
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setHoverPos({ x: rect.right, y: rect.top + window.scrollY })
              setHoveredCard(card)
            }}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onRemove(card)}
            onContextMenu={(e) => {
              e.preventDefault()
              onPreview(card)
            }}
          >
            {/* Quantity indicator */}
            <div className="flex-shrink-0 w-6 h-8 bg-slate-700 flex items-center justify-center text-xs font-bold text-white rounded-l border-r border-slate-600 transition-all duration-200 group-hover:bg-slate-600">
              {count}
            </div>
            
            {/* Card thumbnail */}
            <div className="flex-shrink-0 w-8 h-8 overflow-hidden transition-transform duration-200 group-hover:scale-110">
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center transition-colors duration-200 group-hover:bg-slate-600">
                  <span className="text-xs text-slate-400">?</span>
                </div>
              )}
            </div>

            {/* Card name */}
            <div className="flex-grow min-w-0 px-2 py-1">
              <div className="text-xs font-medium text-white truncate transition-all duration-200 group-hover:text-slate-200">
                {name}
              </div>
            </div>

            {/* Tape cost */}
            {card.tape_cost !== undefined && (
              <div className="flex-shrink-0 w-6 h-8 bg-purple-800 flex items-center justify-center text-xs font-bold text-white rounded-r border-l border-slate-600 transition-all duration-200 group-hover:bg-purple-700">
                {card.tape_cost}
              </div>
            )}
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div 
          className={`text-slate-400 text-xs italic p-4 text-center bg-slate-800/30 rounded border border-slate-600/20 transition-all duration-300 ${
            isDragOver ? 'border-slate-400 bg-slate-700/30 scale-105 text-slate-300' : 'hover:bg-slate-800/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <span>Drop cards here for {title.toLowerCase()}</span>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            </div>
          ) : (
            `No cards in ${title.toLowerCase()}`
          )}
        </div>
      )}

      {/* Tooltip Preview with animation */}
      {hoveredCard?.imageUrl && (
        <div
          className="absolute z-40 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            top: hoverPos.y + 10,
            left: hoverPos.x + 10,
            backgroundColor: 'black',
            padding: '4px',
            border: '2px solid #8b5cf6',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
          }}
        >
          <img
            src={hoveredCard.imageUrl}
            alt={hoveredCard.name}
            className="w-48 h-auto rounded transition-transform duration-200 hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

function FilterPanel({
  filters,
  setFilters,
  toggleKeyword,
  cards,
  expansions,
}: {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  toggleKeyword: (kw: string) => void
  cards: CardData[]
  expansions: string[]
}) {
  return (
    <>
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-slate-200">Search All Text</label>
        <div className="relative">
          <Search size={16} className="absolute left-2 top-2 text-purple-800" />
          <input
            type="text"
            className="w-full pl-8 p-2 rounded bg-slate-800 text-white border border-slate-600/50 focus:border-purple-800/50 focus:ring-1 focus:ring-purple-800/20 transition-all duration-200 text-sm"
            value={filters.searchText}
            onChange={(e) =>
              setFilters((f: Filters) => ({ ...f, searchText: e.target.value }))
            }
            placeholder="Search name, effect, flavor..."
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-slate-200">Card Name</label>
        <input
          type="text"
          className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600/50 focus:border-purple-800/50 focus:ring-1 focus:ring-purple-800/20 transition-all duration-200 text-sm"
          value={filters.name}
          onChange={(e) =>
            setFilters((f: Filters) => ({ ...f, name: e.target.value }))
          }
          placeholder="Exact name filter"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-slate-200">Type</label>
        <select
          className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600/50 focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/20 transition-all duration-200 text-sm"
          value={filters.type}
          onChange={(e) =>
            setFilters((f: Filters) => ({ ...f, type: e.target.value }))
          }
        >
          <option value="">All Types</option>
          <option value="Character">Character</option>
          <option value="LolCow">LolCow</option>
          <option value="Scribe">Scribe</option>
          <option value="Trole">Trole</option>
          <option value="Universal">Universal</option>
          <option value="Companion">Companion</option>
          <option value="Den">Den</option>
          <option value="Item">Item</option>
          <option value="Trickery">Trickery</option>
          <option value="Magick">Magick</option>
          <option value="Tape">Tape</option>
          <option value="Token">Token</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-slate-200">Subtype</label>
        <input
          type="text"
          className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600/50 focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/20 transition-all duration-200 text-sm"
          value={filters.subtype}
          onChange={(e) =>
            setFilters((f: Filters) => ({ ...f, subtype: e.target.value }))
          }
          placeholder="Filter by subtype"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-slate-200">Expansion</label>
        <select
          className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600/50 focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/20 transition-all duration-200 text-sm"
          value={filters.expansion}
          onChange={(e) =>
            setFilters((f: Filters) => ({ ...f, expansion: e.target.value }))
          }
        >
          <option value="">All Expansions</option>
          {expansions.map(expansion => (
            <option key={expansion} value={expansion}>{expansion}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-slate-200">Tape Cost</label>
        <input
          type="number"
          className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600/50 focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/20 transition-all duration-200 text-sm"
          value={filters.tape_cost}
          onChange={(e) =>
            setFilters((f: Filters) => ({ ...f, tape_cost: e.target.value }))
          }
          placeholder="Filter by cost"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-slate-200">Artist</label>
        <input
          type="text"
          className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600/50 focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/20 transition-all duration-200 text-sm"
          value={filters.artist}
          onChange={(e) =>
            setFilters((f: Filters) => ({ ...f, artist: e.target.value }))
          }
          placeholder="Filter by artist"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium mb-2 text-slate-200">Keywords</label>
        <div className="grid grid-cols-2 gap-1">
          {ALL_KEYWORDS.map((kw) => (
            <label key={kw} className="flex items-center gap-1 p-1 rounded bg-slate-800/50 border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 rounded text-violet-600 focus:ring-violet-500 focus:ring-1 bg-slate-700 border-slate-500"
                checked={filters.keywords.includes(kw)}
                onChange={() => toggleKeyword(kw)}
              />
              <span className="text-xs text-slate-300 font-medium">{kw}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <button
          className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-3 rounded shadow transition-all duration-200 text-sm"
          onClick={() =>
            setFilters({
              name: '',
              type: '',
              subtype: '',
              expansion: '',
              tape_cost: '',
              artist: '',
              keywords: [],
              searchText: '',
            })
          }
        >
          Clear All Filters
        </button>
      </div>

      <div className="p-3 bg-purple-900/30 rounded border border-purple-500/20 text-xs text-slate-300">
        <strong className="text-purple-300">Controls:</strong><br/>
        <div className="mt-1 space-y-0.5">
          <div><span className="text-amber-300">M</span> - Add to Main</div>
          <div><span className="text-emerald-300">T</span> - Add to Tape</div>
          <div><span className="text-yellow-300">S</span> - Add to Side</div>
          <div><span className="text-cyan-300">Drag & Drop</span> - Drag cards to deck sections</div>
        </div>
        <div className="mt-1 text-purple-400 italic">
          (Hover over card first for shortcuts)
        </div>
      </div>
    </>
  )
}

export default function DeckbuilderPage() {
  // State management
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    name: '',
    type: '',
    subtype: '',
    expansion: '',
    tape_cost: '',
    artist: '',
    keywords: [],
    searchText: '',
  })

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([])

  // Deck states
  const [mainDeck, setMainDeck] = useState<CardData[]>([])
  const [tapeDeck, setTapeDeck] = useState<CardData[]>([])
  const [sideDeck, setSideDeck] = useState<CardData[]>([])

  // UI states
  const [deckName, setDeckName] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [savedDecks, setSavedDecks] = useState<string[]>([])
  const [selectedDeckToLoad, setSelectedDeckToLoad] = useState('')
  const [previewCard, setPreviewCard] = useState<CardData | null>(null)
  const [previewQuantity, setPreviewQuantity] = useState(1)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [deckSort, setDeckSort] = useState<SortOption>('name')
  const [showPlaytest, setShowPlaytest] = useState(false)
  const [hand, setHand] = useState<CardData[]>([])
  const [showHandModal, setShowHandModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [draggedCard, setDraggedCard] = useState<CardData | null>(null)
  const [showMulliganModal, setShowMulliganModal] = useState(false)
  const [selectedMulliganCards, setSelectedMulliganCards] = useState<number[]>([])
  const [deckForDrawing, setDeckForDrawing] = useState<CardData[]>([])
  const [hasUsedMulligan, setHasUsedMulligan] = useState(false)
  const [showCardAnimation, setShowCardAnimation] = useState<{card: CardData, target: 'main' | 'tape' | 'side', fromRect: DOMRect} | null>(null)

  // Helper function to safely access localStorage
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      try {
        return typeof window !== 'undefined' ? localStorage.getItem(key) : null
      } catch {
        return null
      }
    },
    setItem: (key: string, value: string): boolean => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value)
          return true
        }
        return false
      } catch {
        return false
      }
    },
    removeItem: (key: string): boolean => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key)
          return true
        }
        return false
      } catch {
        return false
      }
    }
  }

  // Toast utility functions
  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, message, type, duration }
    setToasts([newToast]) // Replace all existing toasts with just the new one
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Reset preview quantity when card changes
  useEffect(() => {
    setPreviewQuantity(1)
  }, [previewCard])

  // Get unique expansions for filter dropdown
  const expansions = useMemo(() => {
    const expansionMap = new Map<string, string>() // normalized -> original
    
    cards.forEach(card => {
      if (card.expansion) {
        const trimmed = card.expansion.trim()
        const normalized = trimmed.toLowerCase()
        if (!expansionMap.has(normalized)) {
          expansionMap.set(normalized, trimmed)
        }
      }
    })
    
    return Array.from(expansionMap.values()).sort()
  }, [cards])

  // Fuzzy search function
  const fuzzySearch = useCallback((query: string, text: string): boolean => {
    if (!query) return true
    const searchTerms = query.toLowerCase().split(' ')
    const searchText = text.toLowerCase()
    return searchTerms.every(term => searchText.includes(term))
  }, [])

  // Enhanced search with fuzzy matching and card text search
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesName = fuzzySearch(filters.name, card.name)
      const matchesSearchText = filters.searchText ? 
        fuzzySearch(filters.searchText, `${card.name} ${card.effect || ''} ${card.flavor_text || ''} ${card.subtype || ''}`) : true
      
      const characterTypes = ['lolcow', 'scribe', 'trole', 'companion', 'universal']
      const cardType = card.type?.toLowerCase() || ''
      
      const matchesType = filters.type
        ? filters.type.toLowerCase() === 'character'
          ? characterTypes.includes(cardType) || 
            cardType.includes('lolcow') || 
            cardType.includes('scribe') || 
            cardType.includes('trole') || 
            cardType.includes('troll')
          : filters.type.toLowerCase() === 'lolcow'
          ? cardType === 'lolcow' || cardType.includes('lolcow')
          : filters.type.toLowerCase() === 'scribe'
          ? cardType === 'scribe' || cardType.includes('scribe')
          : filters.type.toLowerCase() === 'trole'
          ? cardType === 'trole' || cardType.includes('trole') || cardType.includes('troll')
          : cardType === filters.type.toLowerCase()
        : true

      const matchesSubtype = filters.subtype ? card.subtype?.toLowerCase().includes(filters.subtype.toLowerCase()) : true
      const matchesExpansion = filters.expansion ? card.expansion?.toLowerCase() === filters.expansion.toLowerCase() : true
      const matchesTapeCost = filters.tape_cost !== '' ? card.tape_cost === Number(filters.tape_cost) : true
      const matchesArtist = filters.artist ? card.artist?.toLowerCase().includes(filters.artist.toLowerCase()) : true
      
      const matchesKeywords = filters.keywords.length > 0 ? (() => {
        const cardKeywords = Array.isArray(card.keywords) ? card.keywords : (card.keywords ? [card.keywords] : [])
        return filters.keywords.every((kw) => 
          cardKeywords.some((k) => k.toLowerCase().includes(kw.toLowerCase()))
        )
      })() : true

      return matchesName && matchesSearchText && matchesType && matchesSubtype && matchesExpansion && matchesTapeCost && matchesArtist && matchesKeywords
    })
  }, [cards, filters, fuzzySearch])

  // Deck validation
  const deckValidation = useMemo(() => {
    const errors: string[] = []
    const warnings: string[] = []

    // Main deck validation
    if (mainDeck.length < 40) errors.push(`Main deck has ${mainDeck.length} cards (minimum 40 required for tournament play)`)
    if (mainDeck.length > 120) errors.push(`Main deck has ${mainDeck.length} cards (maximum 120)`)
    
    // Tape deck validation  
    if (tapeDeck.length !== 10) {
      if (tapeDeck.length < 10) errors.push(`Tape deck has ${tapeDeck.length} cards (exactly 10 required for tournament play)`)
      if (tapeDeck.length > 10) errors.push(`Tape deck has ${tapeDeck.length} cards (exactly 10 required for tournament play)`)
    }

    // Check for Scribe/Lolcow conflict
    const hasScribe = mainDeck.some(c => c.type === 'Scribe')
    const hasLolcow = mainDeck.some(c => c.type === 'LolCow')
    if (hasScribe && hasLolcow) {
      errors.push('Scribes and Lolcows cannot be in the same main deck')
    }

    // Tournament legality check
    const isTournamentLegal = mainDeck.length >= 40 && mainDeck.length <= 120 && tapeDeck.length === 10 && errors.length === 0

    return { errors, warnings, isValid: errors.length === 0, isTournamentLegal }
  }, [mainDeck, tapeDeck])

  // Deck statistics
  const deckStats = useMemo(() => {
    const allCards = [...mainDeck, ...sideDeck]
    const tapeCostDistribution = allCards.reduce((acc, card) => {
      const cost = card.tape_cost || 0
      acc[cost] = (acc[cost] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const typeBreakdown = allCards.reduce((acc, card) => {
      const type = card.type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageTapeCost = allCards.length > 0 
      ? allCards.reduce((sum, card) => sum + (card.tape_cost || 0), 0) / allCards.length 
      : 0

    return {
      tapeCostDistribution,
      typeBreakdown,
      averageTapeCost: Math.round(averageTapeCost * 100) / 100,
      totalCards: allCards.length
    }
  }, [mainDeck, sideDeck])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return
      
      if (hoveredCard) {
        const card = cards.find(c => c.name === hoveredCard)
        if (!card) return

        switch (e.key.toLowerCase()) {
          case 'm':
            e.preventDefault()
            addCardToDeck(card, 'main')
            break
          case 't':
            e.preventDefault()
            addCardToDeck(card, 'tape')
            break
          case 's':
            e.preventDefault()
            addCardToDeck(card, 'side')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hoveredCard, cards])

  // Load cards and saved decks on mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true)
        const response = await fetch('/cards.json')
        if (!response.ok) {
          throw new Error('Failed to load cards')
        }
        const cardsData = await response.json()
        setCards(cardsData)
        
        // Load saved decks
        const decksData = safeLocalStorage.getItem('lolcow_decks')
        const decks = decksData ? JSON.parse(decksData) : {}
        setSavedDecks(Object.keys(decks))
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cards')
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [])

  // Deck management functions
  const saveDeck = () => {
    if (!deckName.trim()) {
      addToast('Please enter a deck name.', 'error')
      return
    }

    const deck: DeckData = {
      main: mainDeck,
      tape: tapeDeck,
      side: sideDeck,
      name: deckName,
      description: deckDescription,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString()
    }

    const existing = safeLocalStorage.getItem('lolcow_decks')
    const decks = existing ? JSON.parse(existing) : {}
    
    if (decks[deckName]) {
      deck.dateCreated = decks[deckName].dateCreated
    }
    
    decks[deckName] = deck
    
    if (safeLocalStorage.setItem('lolcow_decks', JSON.stringify(decks))) {
      setSavedDecks(Object.keys(decks))
      addToast(`Deck "${deckName}" saved successfully!`, 'success')
    } else {
      addToast('Failed to save deck - localStorage not available', 'error')
    }
  }

  const loadDeck = (deckName: string) => {
    const existing = safeLocalStorage.getItem('lolcow_decks')
    const decks = existing ? JSON.parse(existing) : {}
    const deck = decks[deckName]
    
    if (!deck) {
      addToast('Deck not found.', 'error')
      return
    }

    setMainDeck(deck.main || [])
    setTapeDeck(deck.tape || [])
    setSideDeck(deck.side || [])
    setDeckName(deck.name || deckName)
    setDeckDescription(deck.description || '')
    addToast(`Deck "${deckName}" loaded successfully!`, 'success')
  }

  const deleteDeck = () => {
    if (!selectedDeckToLoad) return
    
    const existing = safeLocalStorage.getItem('lolcow_decks')
    const decks = existing ? JSON.parse(existing) : {}
    
    delete decks[selectedDeckToLoad]
    
    if (safeLocalStorage.setItem('lolcow_decks', JSON.stringify(decks))) {
      setSavedDecks(Object.keys(decks))
      const deletedName = selectedDeckToLoad
      setSelectedDeckToLoad('')
      addToast(`Deck "${deletedName}" deleted successfully.`, 'success')
    } else {
      addToast('Failed to delete deck - localStorage not available', 'error')
    }
  }

  const deleteDeckWithConfirmation = () => {
    if (!selectedDeckToLoad) return
    
    if (!confirm(`Are you sure you want to delete "${selectedDeckToLoad}"?`)) return
    
    deleteDeck()
  }

  const clearAllDecks = () => {
    if (!confirm('Are you sure you want to clear all decks?')) return
    setMainDeck([])
    setTapeDeck([])
    setSideDeck([])
  }

  const exportDeck = () => {
    if (!deckValidation.isTournamentLegal) {
      addToast('Cannot export: Deck is not tournament legal. Please ensure you have at least 40 cards in main deck and exactly 10 cards in tape deck.', 'error')
      return
    }

    const formatDeckSection = (title: string, cards: CardData[]) => {
      if (cards.length === 0) return ''
      
      const grouped = cards.reduce((acc, card) => {
        acc[card.name] = (acc[card.name] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const lines = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => `${count}x ${name}`)

      return `${title} (${cards.length}):\n${lines.join('\n')}\n\n`
    }

    const deckText = [
      `=== ${deckName || 'Untitled Deck'} ===\n`,
      deckDescription ? `${deckDescription}\n\n` : '',
      formatDeckSection('Main Deck', mainDeck),
      formatDeckSection('Tape Deck', tapeDeck),
      formatDeckSection('Side Deck', sideDeck),
      '=== End Deck ==='
    ].join('')

    const blob = new Blob([deckText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${deckName || 'lolcow_deck'}.txt`
    link.click()
    URL.revokeObjectURL(url)
    
    addToast('Deck exported successfully!', 'success')
  }

  const generateShareableText = () => {
    const formatDeckSection = (title: string, cards: CardData[]) => {
      if (cards.length === 0) return ''
      
      const grouped = cards.reduce((acc, card) => {
        acc[card.name] = (acc[card.name] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const lines = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => `${count}x ${name}`)

      return `${title} (${cards.length}):\n${lines.join('\n')}\n\n`
    }

    const deckText = [
      `=== ${deckName || 'Untitled Deck'} ===\n`,
      deckDescription ? `${deckDescription}\n\n` : '',
      formatDeckSection('Main Deck', mainDeck),
      formatDeckSection('Tape Deck', tapeDeck),
      formatDeckSection('Side Deck', sideDeck),
      '=== End Deck ==='
    ].join('')

    navigator.clipboard.writeText(deckText).then(() => {
      addToast('Deck list copied to clipboard!', 'success')
    }).catch(() => {
      addToast('Failed to copy to clipboard', 'error')
    })
  }

  // Import functions
  const parseTextDeckList = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const importedMain: CardData[] = []
    const importedTape: CardData[] = []
    const importedSide: CardData[] = []
    
    let currentSection: 'main' | 'tape' | 'side' | 'none' = 'none'
    let deckNameFromText = ''
    let deckDescFromText = ''

    for (const line of lines) {
      // Check for deck name
      if (line.startsWith('===') && line.endsWith('===')) {
        deckNameFromText = line.replace(/=/g, '').trim()
        continue
      }

      // Check for section headers
      if (line.toLowerCase().includes('main deck')) {
        currentSection = 'main'
        continue
      }
      if (line.toLowerCase().includes('tape deck')) {
        currentSection = 'tape'
        continue
      }
      if (line.toLowerCase().includes('side deck')) {
        currentSection = 'side'
        continue
      }

      // Skip empty lines and end markers
      if (line.toLowerCase().includes('=== end deck ===') || currentSection === 'none') {
        continue
      }

      // Parse card lines (format: "3x Card Name" or "3 Card Name")
      const cardMatch = line.match(/^(\d+)x?\s+(.+)$/i)
      if (cardMatch) {
        const count = parseInt(cardMatch[1])
        const cardName = cardMatch[2].trim()
        
        // Find the card in our database
        const foundCard = cards.find(card => 
          card.name.toLowerCase() === cardName.toLowerCase()
        )
        
        if (foundCard) {
          const targetDeck = currentSection === 'main' ? importedMain :
                           currentSection === 'tape' ? importedTape : importedSide
          
          for (let i = 0; i < count; i++) {
            targetDeck.push(foundCard)
          }
        }
      }
    }

    return {
      main: importedMain,
      tape: importedTape,
      side: importedSide,
      name: deckNameFromText,
      description: deckDescFromText
    }
  }

  const importFromText = () => {
    try {
      const parsed = parseTextDeckList(importText)
      setMainDeck(parsed.main)
      setTapeDeck(parsed.tape)
      setSideDeck(parsed.side)
      if (parsed.name) setDeckName(parsed.name)
      setImportText('')
      setShowImportModal(false)
      addToast(`Deck imported! ${parsed.main.length} main, ${parsed.tape.length} tape, ${parsed.side.length} side cards`, 'success')
    } catch (error) {
      addToast('Error parsing deck list. Please check the format.', 'error')
    }
  }

  // Card validation and deck manipulation
  const canAddCardToDeck = (card: CardData, targetDeck: 'main' | 'tape' | 'side'): string | null => {
    const allCopies = [...mainDeck, ...sideDeck, ...tapeDeck].filter(c => c.name === card.name)
    const nameCount = allCopies.length
    const isBasicTape = card.name?.toLowerCase().includes('basic tape')
    const isToyTank = card.name?.toLowerCase() === 'toy tank'

    if (card.name?.toLowerCase().includes('cipher tape')) {
      return 'Cipher Tapes cannot be added to any deck.'
    }

    if (card.type === 'Token') return 'Tokens cannot be added to any deck.'

    if (targetDeck === 'main') {
      if (card.type === 'Tape') return 'Tapes cannot go in the main deck.'
      if (mainDeck.length >= 120) return 'Main deck is full.'
      if (!isBasicTape && !isToyTank && nameCount >= 3) return 'You can only have 3 total copies of a card between main and side decks.'

      const hasScribe = mainDeck.some(c => c.type === 'Scribe')
      const hasLolcow = mainDeck.some(c => c.type === 'LolCow')
      const incoming = card.type

      if ((hasScribe && incoming === 'LolCow') || (hasLolcow && incoming === 'Scribe')) {
        return 'Scribes and Lolcows cannot be in the same main deck.'
      }

      return null
    }

    if (targetDeck === 'tape') {
      if (card.type !== 'Tape') return 'Only Tapes can go in the tape deck.'
      if (tapeDeck.length >= 10) return 'Tape deck must be exactly 10 cards.'
      if (!isBasicTape && card.rarity === 'Special') {
        // Check both tape deck and side deck for Special Tapes
        const specialTapeCount = [...tapeDeck, ...sideDeck].filter(c => c.name === card.name).length
        if (specialTapeCount >= 1) return 'Only 1 copy of a Special Tape allowed between tape and side decks.'
      }
      if (!isBasicTape && nameCount >= 3) return 'Max 3 copies total of a tape between decks.'
      return null
    }

    if (targetDeck === 'side') {
      if (sideDeck.length >= 10) return 'Side deck cannot exceed 10 cards.'
      if (card.type === 'Tape') {
        // Special validation for Special Tapes in side deck
        if (!isBasicTape && card.rarity === 'Special') {
          const specialTapeCount = [...tapeDeck, ...sideDeck].filter(c => c.name === card.name).length
          if (specialTapeCount >= 1) return 'Only 1 copy of a Special Tape allowed between tape and side decks.'
        }
        if (!isBasicTape && nameCount >= 3) return 'Max 3 copies total of a tape between decks.'
        return null
      }
      if (!isBasicTape && !isToyTank && nameCount >= 3) return 'Only 3 total copies allowed between main and side decks.'
      return null
    }

    return null
  }

  const addCardToDeck = (card: CardData, targetDeck: 'main' | 'tape' | 'side', count: number = 1) => {
    let addedCount = 0
    
    for (let i = 0; i < count; i++) {
      const error = canAddCardToDeck(card, targetDeck)
      if (error) {
        if (addedCount === 0) {
          addToast(error, 'error')
        } else {
          addToast(`Added ${addedCount} of ${count} copies. ${error}`, 'warning')
        }
        break
      }

      if (targetDeck === 'main') setMainDeck(prev => [...prev, card])
      if (targetDeck === 'tape') setTapeDeck(prev => [...prev, card])
      if (targetDeck === 'side') setSideDeck(prev => [...prev, card])
      
      addedCount++
    }

    if (addedCount > 0) {
      const deckName = targetDeck === 'main' ? 'main deck' : targetDeck === 'tape' ? 'tape deck' : 'side deck'
      const message = addedCount === 1 
        ? `Added ${card.name} to ${deckName}`
        : `Added ${addedCount}x ${card.name} to ${deckName}`
      addToast(message, 'success')
    }
  }

  const removeCard = (card: CardData, deck: 'main' | 'tape' | 'side') => {
    const update = (arr: CardData[]) => {
      const index = arr.findIndex(c => c.name === card.name)
      if (index !== -1) {
        return arr.filter((_, i) => i !== index)
      }
      return arr
    }

    if (deck === 'main') setMainDeck(update(mainDeck))
    if (deck === 'tape') setTapeDeck(update(tapeDeck))
    if (deck === 'side') setSideDeck(update(sideDeck))
  }

  const toggleKeyword = (keyword: string) => {
    setFilters(prev => ({
      ...prev,
      keywords: prev.keywords.includes(keyword)
        ? prev.keywords.filter(kw => kw !== keyword)
        : [...prev.keywords, keyword]
    }))
  }

  const sortedDeckCards = (cards: CardData[]) => {
    const grouped = cards.reduce((acc, card) => {
      const key = card.name
      if (acc[key]) {
        acc[key].count++
      } else {
        acc[key] = { card: { ...card }, count: 1 }
      }
      return acc
    }, {} as Record<string, { card: CardData; count: number }>)

    return Object.entries(grouped).sort(([a, dataA], [b, dataB]) => {
      switch (deckSort) {
        case 'name':
          return a.localeCompare(b)
        case 'type':
          return (dataA.card.type || '').localeCompare(dataB.card.type || '')
        case 'tape_cost':
          return (dataA.card.tape_cost || 0) - (dataB.card.tape_cost || 0)
        case 'attack':
          return (dataA.card.attack || 0) - (dataB.card.attack || 0)
        case 'health':
          return (dataA.card.health || 0) - (dataB.card.health || 0)
        default:
          return a.localeCompare(b)
      }
    })
  }

  // Playtesting functions
  const drawHand = () => {
    const shuffled = [...mainDeck].sort(() => Math.random() - 0.5)
    const openingHand = shuffled.slice(0, 5)
    const remaining = shuffled.slice(5)
    
    setHand(openingHand)
    setDeckForDrawing(remaining)
    setHasUsedMulligan(false)
    setSelectedMulliganCards([])
    
    // Auto-open mulligan modal if we have 5 cards
    if (openingHand.length === 5) {
      setShowMulliganModal(true)
    }
  }

  const drawCard = () => {
    if (hand.length >= 10) return // Hand size limit
    if (deckForDrawing.length === 0) return
    
    const newCard = deckForDrawing[0]
    const remainingDeck = deckForDrawing.slice(1)
    
    setHand(prev => [...prev, newCard])
    setDeckForDrawing(remainingDeck)
  }

  const removeFromHand = (index: number) => {
    setHand(prev => prev.filter((_, i) => i !== index))
  }

  const keepHand = () => {
    setShowMulliganModal(false)
    setHasUsedMulligan(true)
  }

  const performMulligan = () => {
    if (selectedMulliganCards.length === 0) {
      keepHand()
      return
    }

    // Get the cards to mulligan and the cards to keep
    const cardsToMulligan = selectedMulliganCards.map(index => hand[index])
    const cardsToKeep = hand.filter((_, index) => !selectedMulliganCards.includes(index))
    
    // Draw new cards from the top of the deck
    const newCards = deckForDrawing.slice(0, selectedMulliganCards.length)
    const remainingDeck = deckForDrawing.slice(selectedMulliganCards.length)
    
    // Put mulliganed cards at the bottom of the remaining deck
    const newDeckForDrawing = [...remainingDeck, ...cardsToMulligan]
    
    // Update state
    setHand([...cardsToKeep, ...newCards])
    setDeckForDrawing(newDeckForDrawing)
    setSelectedMulliganCards([])
    setShowMulliganModal(false)
    setHasUsedMulligan(true)
  }

  const toggleMulliganCard = (index: number) => {
    setSelectedMulliganCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded animate-pulse"></div>
            <div>
              <div className="w-32 h-5 bg-slate-700 rounded animate-pulse mb-1"></div>
              <div className="w-20 h-3 bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
        </div>
        
        {/* Main content */}
        <div className="flex">
          {/* Filter sidebar skeleton */}
          <div className="w-72 bg-slate-900 p-4 border-r border-slate-700 space-y-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="space-y-2">
                <div className="w-20 h-3 bg-slate-700 rounded animate-pulse"></div>
                <div className="w-full h-8 bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          
          {/* Cards grid skeleton */}
          <div className="flex-1 p-4">
            <div className="mb-4 space-y-3">
              <div className="flex gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="w-20 h-8 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="w-full h-12 bg-slate-700 rounded animate-pulse"></div>
            </div>
            <LoadingGrid />
          </div>
          
          {/* Deck list sidebar skeleton */}
          <div className="w-72 bg-slate-900 p-4 border-l border-slate-700 space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="space-y-2">
                <div className="w-24 h-4 bg-slate-700 rounded animate-pulse"></div>
                <div className="space-y-1">
                  {Array.from({ length: 4 }, (_, j) => (
                    <div key={j} className="w-full h-6 bg-slate-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="text-center p-6 bg-slate-800 rounded-lg border border-red-500/30 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <XCircle className="w-16 h-16 text-red-400 animate-pulse" />
            <div className="absolute inset-0 border-2 border-red-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="text-red-300 mb-2 animate-in slide-in-from-bottom-2 duration-700">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-500 active:bg-red-700 px-4 py-2 rounded font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform animate-in slide-in-from-bottom-4 duration-1000"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="flex flex-col lg:flex-row h-screen bg-slate-950 text-white overflow-hidden">
      {/* Mobile filter toggle */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-slate-900 border-b border-slate-700">
        <h1 className="text-lg font-bold text-amber-300">LolCow TCG</h1>
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all duration-200"
        >
          {mobileFiltersOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Filter panel */}
      <aside className={`
        ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block
        w-full lg:w-72 bg-slate-900 p-4 border-r border-slate-700 
        overflow-y-auto h-full lg:sticky lg:top-0
        ${mobileFiltersOpen ? 'absolute z-20' : ''}
      `}>
        <div className="hidden lg:block mb-4">
          <h1 className="text-xl font-bold mb-1 text-amber-300">LolCow TCG</h1>
          <p className="text-violet-300 text-sm">Deckbuilder</p>
        </div>
        
        <FilterPanel 
          filters={filters} 
          setFilters={setFilters} 
          toggleKeyword={toggleKeyword}
          cards={cards}
          expansions={expansions}
        />
      </aside>

      {/* Main content */}
      <section className="flex-1 overflow-y-auto p-4 bg-slate-950">
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            {/* Deck management */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Deck name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="bg-slate-800 text-white p-2 rounded border border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all duration-200 w-full sm:w-40 text-sm"
              />
              <input
                type="text"
                placeholder="Description"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                className="bg-slate-800 text-white p-2 rounded border border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all duration-200 w-full sm:w-40 text-sm"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveDeck}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform"
              >
                Save
              </button>
              <button
                onClick={() => selectedDeckToLoad && loadDeck(selectedDeckToLoad)}
                disabled={!selectedDeckToLoad}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-600 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 disabled:transform-none hover:shadow-lg transform"
              >
                Load
              </button>
              <button
                onClick={deleteDeckWithConfirmation}
                disabled={!selectedDeckToLoad}
                className="bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-slate-600 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 disabled:transform-none hover:shadow-lg transform"
              >
                Delete
              </button>
              <button
                onClick={clearAllDecks}
                className="bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform"
              >
                Clear All
              </button>
            </div>

            {/* Utility buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportDeck}
                disabled={!deckValidation.isTournamentLegal}
                className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-slate-600 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 disabled:transform-none hover:shadow-lg transform"
                title={!deckValidation.isTournamentLegal ? 'Deck must be tournament legal to export' : 'Export tournament legal deck as text file'}
              >
                <Download size={14} className="transition-transform duration-200 group-hover:translate-y-0.5" />
                Export {!deckValidation.isTournamentLegal && '🔒'}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 hover:shadow-lg transform group"
              >
                <Search size={14} className="transition-transform duration-200 group-hover:rotate-12" />
                Import
              </button>
              <button
                onClick={generateShareableText}
                className="bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 hover:shadow-lg transform group"
              >
                <Copy size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                Copy
              </button>
              <button
                onClick={() => setShowStatsModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 hover:shadow-lg transform group"
              >
                <BarChart3 size={14} className="transition-transform duration-200 group-hover:scale-110" />
                Stats
              </button>
              <button
                onClick={() => setShowPlaytest(!showPlaytest)}
                className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 hover:shadow-lg transform group"
              >
                <Shuffle size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                Test Draw
              </button>
            </div>

            {/* Deck selector */}
            <select
              value={selectedDeckToLoad}
              onChange={(e) => setSelectedDeckToLoad(e.target.value)}
              className="bg-slate-800 text-white p-2 rounded border border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all duration-200 w-full sm:w-48 text-sm"
            >
              <option value="">Select deck to load</option>
              {savedDecks.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Deck validation indicators */}
          {(deckValidation.errors.length > 0 || deckValidation.warnings.length > 0) && (
            <div className="mb-3 p-2 bg-slate-800 rounded border border-slate-600 space-y-1">
              {deckValidation.errors.map((error, i) => (
                <div key={i} className="flex items-center gap-2 text-red-300 text-xs bg-red-900/20 p-2 rounded border border-red-500/30">
                  <XCircle size={12} className="text-red-400" />
                  {error}
                </div>
              ))}
              {deckValidation.warnings.map((warning, i) => (
                <div key={i} className="flex items-center gap-2 text-amber-300 text-xs bg-amber-900/20 p-2 rounded border border-amber-500/30">
                  <AlertTriangle size={12} className="text-amber-400" />
                  {warning}
                </div>
              ))}
              {deckValidation.isValid && deckValidation.warnings.length === 0 && deckValidation.isTournamentLegal && (
                <div className="flex items-center gap-2 text-emerald-300 text-xs bg-emerald-900/20 p-2 rounded border border-emerald-500/30">
                  <CheckCircle size={12} className="text-emerald-400" />
                  Tournament legal deck
                </div>
              )}
            </div>
          )}
        </div>

        {/* Playtesting panel */}
        {showPlaytest && (
          <div className="mb-3 p-3 bg-slate-800 rounded border border-slate-600 animate-in slide-in-from-top-4 fade-in-0 duration-300">
            <h3 className="text-base font-bold mb-2 text-amber-300">Playtesting Suite</h3>
            <div className="flex gap-2 mb-2">
              <button
                onClick={drawHand}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform group"
                disabled={mainDeck.length === 0}
              >
                <span className="flex items-center gap-1">
                  New Game 
                  <span className="transition-transform duration-200 group-hover:rotate-12">(Draw 5)</span>
                </span>
              </button>
              <button
                onClick={drawCard}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform disabled:transform-none disabled:bg-slate-600 disabled:opacity-50"
                disabled={mainDeck.length === 0 || deckForDrawing.length === 0}
              >
                Draw Card
              </button>
              <button
                onClick={() => {
                  setHand([])
                  setDeckForDrawing([])
                  setHasUsedMulligan(false)
                  setSelectedMulliganCards([])
                }}
                className="bg-red-600 hover:bg-red-500 active:bg-red-700 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform group"
              >
                <span className="transition-transform duration-200 group-hover:rotate-180">Reset</span>
              </button>
              {hand.length > 0 && (
                <button
                  onClick={() => setShowHandModal(true)}
                  className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform animate-in slide-in-from-right-4 duration-300"
                >
                  View Hand ({hand.length})
                </button>
              )}
              {hand.length === 5 && !hasUsedMulligan && (
                <button
                  onClick={() => setShowMulliganModal(true)}
                  className="bg-orange-600 hover:bg-orange-500 active:bg-orange-700 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform animate-in slide-in-from-right-4 duration-300 animate-pulse"
                >
                  Mulligan
                </button>
              )}
            </div>
            <div className="text-xs text-slate-400 transition-all duration-300">
              {deckForDrawing.length > 0 && (
                <span className="animate-in slide-in-from-left-4 duration-500">Cards left in deck: <span className="font-medium text-slate-300">{deckForDrawing.length}</span></span>
              )}
              {mainDeck.length === 0 && (
                <span className="italic animate-pulse">Add cards to your main deck to start playtesting</span>
              )}
            </div>
          </div>
        )}

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredCards.map((card, index) => (
            <CardGridItem
              key={`${card.name}-${index}`}
              card={card}
              onAddToDeck={addCardToDeck}
              onPreview={setPreviewCard}
              onHover={setHoveredCard}
            />
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center text-slate-400 mt-8 py-6">
            <Search size={40} className="mx-auto mb-3 text-slate-500" />
            <p className="text-base">No cards match your current filters</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </section>

      {/* Right side deck list */}
      <aside className="w-full lg:w-72 bg-slate-900 p-4 border-l border-slate-700 overflow-y-auto overflow-x-hidden h-full lg:sticky lg:top-0">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-300 truncate">Deck Lists</h2>
          <select
            value={deckSort}
            onChange={(e) => setDeckSort(e.target.value as SortOption)}
            className="bg-slate-800 text-white text-xs p-1 rounded border border-slate-600 focus:border-amber-400 transition-all duration-200"
          >
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="tape_cost">Cost</option>
            <option value="attack">Attack</option>
            <option value="health">Health</option>
          </select>
        </div>

        <DeckList 
          title="Main Deck" 
          cards={sortedDeckCards(mainDeck)} 
          onRemove={(c) => removeCard(c, 'main')}
          onPreview={setPreviewCard}
          validation={deckValidation}
          deckType="main"
          onAddToDeck={addCardToDeck}
        />
        <DeckList 
          title="Tape Deck" 
          cards={sortedDeckCards(tapeDeck)} 
          onRemove={(c) => removeCard(c, 'tape')}
          onPreview={setPreviewCard}
          validation={deckValidation}
          deckType="tape"
          onAddToDeck={addCardToDeck}
        />
        <DeckList 
          title="Side Deck" 
          cards={sortedDeckCards(sideDeck)} 
          onRemove={(c) => removeCard(c, 'side')}
          onPreview={setPreviewCard}
          validation={deckValidation}
          deckType="side"
          onAddToDeck={addCardToDeck}
        />
      </aside>

      {/* Stats modal */}
      {showStatsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-in fade-in-0 duration-300"
          onClick={() => setShowStatsModal(false)}
        >
          <div
            className="bg-slate-900 text-white p-6 rounded-lg w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto border border-indigo-500/30 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-indigo-300 animate-in slide-in-from-left-4 duration-500">
                Deck Statistics
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white text-xl hover:bg-red-500/20 rounded p-1 transition-all duration-200 hover:scale-110 hover:rotate-90"
              >
                ✕
              </button>
            </div>
            
            {deckStats.totalCards > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-blue-900/30 p-4 rounded border border-blue-500/20">
                    <h4 className="font-medium mb-3 text-blue-200 text-base">Tape Cost Distribution</h4>
                    <div className="h-48 mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(deckStats.tapeCostDistribution).map(([cost, count]) => ({ cost: `Cost ${cost}`, count }))}>
                          <XAxis dataKey="cost" tick={{ fontSize: 12, fill: '#93c5fd' }} />
                          <YAxis tick={{ fontSize: 12, fill: '#93c5fd' }} />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-500/20 text-sm text-blue-200">
                      Average Cost: <span className="font-medium text-blue-300">{deckStats.averageTapeCost}</span>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-900/30 p-4 rounded border border-emerald-500/20">
                    <h4 className="font-medium mb-3 text-emerald-200 text-base">Type Breakdown</h4>
                    <div className="h-48 mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(deckStats.typeBreakdown).map(([type, count]) => ({ name: type, value: count }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#10b981"
                            dataKey="value"
                            label={(entry: any) => `${entry.name} ${((entry.value / deckStats.totalCards) * 100).toFixed(0)}%`}
                            labelLine={false}
                            fontSize={10}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(deckStats.typeBreakdown).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-slate-300">{type}:</span>
                          <span className="text-emerald-300 font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-amber-900/30 p-4 rounded border border-amber-500/20">
                    <h4 className="font-medium mb-3 text-amber-200 text-base">Deck Overview</h4>
                    <div className="h-48 mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { deck: 'Main', count: mainDeck.length },
                          { deck: 'Tape', count: tapeDeck.length },
                          { deck: 'Side', count: sideDeck.length }
                        ]}>
                          <XAxis dataKey="deck" tick={{ fontSize: 12, fill: '#fbbf24' }} />
                          <YAxis tick={{ fontSize: 12, fill: '#fbbf24' }} />
                          <Bar dataKey="count" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Main Deck:</span>
                        <span className="text-amber-300 font-medium">{mainDeck.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Tape Deck:</span>
                        <span className="text-amber-300 font-medium">{tapeDeck.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Side Deck:</span>
                        <span className="text-amber-300 font-medium">{sideDeck.length}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t border-amber-500/20">
                        <span className="text-amber-200">Total Cards:</span>
                        <span className="text-amber-300">{mainDeck.length + tapeDeck.length + sideDeck.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional insights section */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded border border-slate-600/30">
                  <h4 className="font-medium mb-3 text-slate-200 text-base">Deck Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Most Common Type:</span>
                      <span className="ml-2 text-white font-medium">
                        {Object.entries(deckStats.typeBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Card Diversity:</span>
                      <span className="ml-2 text-white font-medium">
                        {Object.keys(deckStats.typeBreakdown).length} different types
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Main Deck Ratio:</span>
                      <span className="ml-2 text-white font-medium">
                        {mainDeck.length + sideDeck.length > 0 ? 
                          `${((mainDeck.length / (mainDeck.length + sideDeck.length)) * 100).toFixed(0)}% main / ${((sideDeck.length / (mainDeck.length + sideDeck.length)) * 100).toFixed(0)}% side`
                          : 'No cards in main/side decks'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Deck Status:</span>
                      <span className="ml-2 font-medium">
                        {deckValidation.isTournamentLegal ? (
                          <span className="text-emerald-400">✓ Tournament Legal</span>
                        ) : (
                          <span className="text-red-400">✗ Not Tournament Legal</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <BarChart3 size={48} className="mx-auto mb-4 text-slate-500" />
                <p className="text-lg mb-2">No deck data to analyze</p>
                <p className="text-sm">Add some cards to your deck to see statistics!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mulligan modal */}
      {showMulliganModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-in fade-in-0 duration-300"
          onClick={() => setShowMulliganModal(false)}
        >
          <div
            className="bg-slate-900 text-white p-6 rounded-lg w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto border border-orange-500/30 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-orange-300 animate-in slide-in-from-left-4 duration-500">
                Mulligan Phase
              </h2>
              <button
                onClick={() => setShowMulliganModal(false)}
                className="text-slate-400 hover:text-white text-xl hover:bg-red-500/20 rounded p-1 transition-all duration-200 hover:scale-110 hover:rotate-90"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 animate-in slide-in-from-top-4 duration-700">
              <p className="text-slate-300 text-center">
                Choose which cards to mulligan. Selected cards will go to the <span className="text-orange-300 font-medium">bottom of your deck</span> and you'll draw that many new cards.
              </p>
              <p className="text-slate-400 text-center text-sm mt-1">
                You can select 0-5 cards to mulligan.
              </p>
            </div>
            
            <div className="grid grid-cols-5 gap-3 mb-6">
              {hand.map((card, index) => (
                <div 
                  key={index} 
                  className={`cursor-pointer transition-all duration-300 relative animate-in zoom-in-0 slide-in-from-bottom-4 ${
                    selectedMulliganCards.includes(index) 
                      ? 'ring-2 ring-orange-400 bg-orange-900/20 scale-95' 
                      : 'hover:scale-105'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => toggleMulliganCard(index)}
                  title={`${card.name} - Click to ${selectedMulliganCards.includes(index) ? 'keep' : 'mulligan'}`}
                >
                  <Card card={card} />
                  {selectedMulliganCards.includes(index) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-orange-500/80 rounded-lg animate-in fade-in-0 zoom-in-95 duration-200">
                      <span className="text-white font-bold text-sm bg-orange-700 px-2 py-1 rounded animate-pulse">
                        MULLIGAN
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-sm text-slate-400 transition-all duration-300">
                {selectedMulliganCards.length === 0 ? (
                  'No cards selected - you will keep your current hand'
                ) : selectedMulliganCards.length === 1 ? (
                  '1 card selected for mulligan'
                ) : (
                  `${selectedMulliganCards.length} cards selected for mulligan`
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={keepHand}
                  className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg transform"
                >
                  Keep Hand
                </button>
                <button
                  onClick={performMulligan}
                  disabled={selectedMulliganCards.length === 0}
                  className="bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:bg-slate-600 text-white px-4 py-2 rounded text-sm font-medium transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 disabled:transform-none hover:shadow-lg transform"
                >
                  {selectedMulliganCards.length === 0 ? 'Select Cards' : `Mulligan ${selectedMulliganCards.length}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hand preview modal */}
      {showHandModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowHandModal(false)}
        >
          <div
            className="bg-slate-900 text-white p-6 rounded-lg w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto border border-violet-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-amber-300">
                Your Hand ({hand.length} cards)
              </h2>
              <div className="flex items-center gap-2">
                {hand.length === 5 && !hasUsedMulligan && (
                  <button
                    onClick={() => {
                      setShowHandModal(false)
                      setShowMulliganModal(true)
                    }}
                    className="bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded text-xs font-medium transition-all duration-200"
                  >
                    Mulligan
                  </button>
                )}
                <button
                  onClick={drawCard}
                  className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded text-xs font-medium transition-all duration-200"
                  disabled={deckForDrawing.length === 0}
                >
                  Draw Card
                </button>
                {deckForDrawing.length > 0 && (
                  <span className="text-xs text-slate-400">
                    ({deckForDrawing.length} left)
                  </span>
                )}
                <button
                  onClick={() => setShowHandModal(false)}
                  className="text-slate-400 hover:text-white text-xl hover:bg-red-500/20 rounded p-1 transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {hand.length > 0 && (
              <div>
                <p className="text-slate-300 mb-4 text-center text-sm">
                  <span className="text-violet-300 font-medium">Click any card to discard it from your hand</span>
                </p>
                <div className={`grid gap-3 ${
                  hand.length <= 5 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
                    : hand.length <= 7
                    ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'
                    : hand.length <= 10
                    ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10'
                    : 'grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9 2xl:grid-cols-12'
                }`}>
                  {hand.map((card, index) => (
                    <div 
                      key={index} 
                      className="cursor-pointer hover:scale-105 transition-all duration-200"
                      onClick={() => removeFromHand(index)}
                      title={`${card.name} - Click to discard`}
                    >
                      <Card card={card} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {hand.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <p className="text-lg mb-1">No cards in hand</p>
                <p className="text-sm">Draw some cards to start playtesting!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="bg-slate-900 text-white p-6 rounded-lg w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto border border-cyan-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-300">
                Import Deck
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white text-xl hover:bg-red-500/20 rounded p-1 transition-all duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Text Import */}
              <div className="p-4 bg-slate-800/50 rounded border border-slate-600/30">
                <h3 className="text-lg font-medium text-slate-200 mb-2">Import from Text File or Paste</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Upload a deck file (.txt) or paste a deck list in the following format:
                </p>
                <div className="text-xs text-slate-500 mb-3 p-2 bg-slate-700/50 rounded font-mono">
                  === Deck Name ===<br/>
                  Main Deck (40):<br/>
                  3x Card Name<br/>
                  2x Another Card<br/>
                  <br/>
                  Tape Deck (10):<br/>
                  1x Tape Card<br/>
                  <br/>
                  Side Deck (5):<br/>
                  2x Side Card
                </div>
                
                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-300 mb-2">Upload Text File:</label>
                  <input
                    type="file"
                    accept=".txt,.text"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const text = event.target?.result as string
                          setImportText(text)
                        }
                        reader.readAsText(file)
                        e.target.value = '' // Reset input
                      }
                    }}
                    className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 file:cursor-pointer cursor-pointer"
                  />
                </div>

                {/* Text Area */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Or Paste Deck List:</label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste your deck list here..."
                    className="w-full h-48 p-3 bg-slate-800 text-white rounded border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200 text-sm font-mono resize-none"
                  />
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={importFromText}
                    disabled={!importText.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white px-4 py-2 rounded text-sm font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    Import Deck
                  </button>
                  <button
                    onClick={() => setImportText('')}
                    className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded text-sm font-medium transition-all duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Import Tips */}
              <div className="p-3 bg-blue-900/20 rounded border border-blue-500/20 text-xs text-blue-200">
                <strong className="text-blue-300">Import Tips:</strong><br/>
                <div className="mt-1 space-y-1">
                  <div>• Upload .txt files exported from this deckbuilder</div>
                  <div>• Text format is flexible - section headers can be "Main Deck", "Tape Deck", "Side Deck"</div>
                  <div>• Card formats: "3x Card Name", "3 Card Name", or "Card Name x3"</div>
                  <div>• Card names must match exactly (case-insensitive)</div>
                  <div>• Only tournament legal decks can be exported</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card preview modal */}
      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="bg-slate-900 text-white p-6 rounded-lg w-[26rem] max-w-full relative max-h-[90vh] overflow-y-auto border border-violet-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewCard(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-xl hover:bg-red-500/20 rounded p-1 transition-all duration-200"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-3 text-amber-300 pr-10">
              {previewCard.name}
            </h2>
            {previewCard.imageUrl && (
              <img
                src={previewCard.imageUrl}
                alt={previewCard.name}
                className="w-full rounded mb-3 border border-slate-600/30"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <div className="space-y-2 text-xs">
              {previewCard.type && (
                <div className="flex justify-between p-2 bg-slate-800/50 rounded border border-slate-600/30">
                  <span className="text-slate-400 font-medium">Type:</span>
                  <span className="text-white font-medium">
                    {previewCard.type}{previewCard.subtype ? ` - ${previewCard.subtype}` : ''}
                  </span>
                </div>
              )}
              {previewCard.tape_cost !== undefined && (
                <div className="flex justify-between p-2 bg-violet-900/30 rounded border border-violet-500/30">
                  <span className="text-violet-300 font-medium">Tape Cost:</span>
                  <span className="text-violet-100 font-bold text-lg">{previewCard.tape_cost}</span>
                </div>
              )}
              {(previewCard.attack !== undefined || previewCard.health !== undefined) && (
                <div className="flex justify-between p-2 bg-amber-900/30 rounded border border-amber-500/30">
                  <span className="text-amber-300 font-medium">Combat Stats:</span>
                  <span className="text-amber-100 font-bold">
                    {previewCard.attack !== undefined && `${previewCard.attack} ATK`}
                    {previewCard.attack !== undefined && previewCard.health !== undefined && ' / '}
                    {previewCard.health !== undefined && `${previewCard.health} HP`}
                  </span>
                </div>
              )}
              {previewCard.keywords && (
                <div className="p-2 bg-blue-900/30 rounded border border-blue-500/30">
                  <span className="text-blue-300 font-medium">Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(previewCard.keywords) ? previewCard.keywords : [previewCard.keywords]).map((keyword, i) => (
                      <span key={i} className="bg-blue-600/50 text-blue-100 px-2 py-1 rounded text-xs font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {previewCard.effect && (
                <div className="p-2 bg-emerald-900/30 rounded border border-emerald-500/30">
                  <span className="text-emerald-300 font-medium block mb-1">Effect:</span>
                  <span className="text-emerald-100 leading-relaxed">{previewCard.effect}</span>
                </div>
              )}
              {previewCard.flavor_text && (
                <div className="p-2 bg-slate-800/50 rounded border border-slate-600/30">
                  <span className="text-slate-300 italic leading-relaxed">"{previewCard.flavor_text}"</span>
                </div>
              )}
              {(previewCard.artist || previewCard.expansion || previewCard.rarity || previewCard.id) && (
                <div className="grid grid-cols-2 gap-2">
                  {previewCard.artist && (
                    <div className="p-2 bg-slate-800/30 rounded">
                      <span className="text-slate-400 text-xs block">Artist</span>
                      <span className="text-slate-200 font-medium">{previewCard.artist}</span>
                    </div>
                  )}
                  {previewCard.expansion && (
                    <div className="p-2 bg-slate-800/30 rounded">
                      <span className="text-slate-400 text-xs block">Expansion</span>
                      <span className="text-slate-200 font-medium">{previewCard.expansion}</span>
                    </div>
                  )}
                  {previewCard.rarity && (
                    <div className="p-2 bg-slate-800/30 rounded">
                      <span className="text-slate-400 text-xs block">Rarity</span>
                      <span className="text-yellow-400 font-medium">{previewCard.rarity}</span>
                    </div>
                  )}
                  {previewCard.id && (
                    <div className="p-2 bg-slate-800/30 rounded">
                      <span className="text-slate-400 text-xs block">Card ID</span>
                      <span className="text-slate-200 font-medium">{previewCard.id}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Quantity selector and add buttons */}
            {previewCard.type !== 'Token' && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-800/30 rounded border border-slate-600/30">
                  <QuantitySelector
                    value={previewQuantity}
                    onChange={setPreviewQuantity}
                    max={10}
                    label="Add Quantity"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {previewCard.type !== 'Tape' && (
                    <button
                      onClick={() => {
                        addCardToDeck(previewCard, 'main', previewQuantity)
                        setPreviewCard(null)
                      }}
                      className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 hover:shadow-lg transform"
                    >
                      Add {previewQuantity}x to Main
                    </button>
                  )}
                  
                  {previewCard.type === 'Tape' && (
                    <button
                      onClick={() => {
                        addCardToDeck(previewCard, 'tape', previewQuantity)
                        setPreviewCard(null)
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 hover:shadow-lg transform"
                    >
                      Add {previewQuantity}x to Tape
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      addCardToDeck(previewCard, 'side', previewQuantity)
                      setPreviewCard(null)
                    }}
                    className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 hover:shadow-lg transform"
                  >
                    Add {previewQuantity}x to Side
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}