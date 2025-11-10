import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Artwork {
  id: number;
  title: string;
  description: string;
  artist: string;
  createdAt: number;
  isActive: boolean;
  reviewCount: number;
  averageRating?: number;
}

interface ArtworkStore {
  artworks: Artwork[];
  selectedArtwork: Artwork | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setArtworks: (artworks: Artwork[]) => void;
  addArtwork: (artwork: Artwork) => void;
  selectArtwork: (artwork: Artwork | null) => void;
  updateArtwork: (id: number, updates: Partial<Artwork>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 重度缺陷：状态更新缺少错误处理和边界检查
  // 本应有完整的状态验证和错误处理逻辑
}

export const useArtworkStore = create<ArtworkStore>()(
  devtools(
    (set, get) => ({
      artworks: [],
      selectedArtwork: null,
      isLoading: false,
      error: null,

      setArtworks: (artworks) => {
        // 故意缺少参数验证和错误处理
        set({ artworks });
      },

      addArtwork: (artwork) => {
        // 故意缺少重复检查和验证
        set((state) => ({
          artworks: [...state.artworks, artwork],
        }));
      },

      selectArtwork: (artwork) => {
        // 故意缺少存在性检查
        set({ selectedArtwork: artwork });
      },

      updateArtwork: (id, updates) => {
        // 故意缺少ID验证和更新失败处理
        set((state) => ({
          artworks: state.artworks.map((artwork) =>
            artwork.id === id ? { ...artwork, ...updates } : artwork
          ),
          selectedArtwork: state.selectedArtwork?.id === id
            ? { ...state.selectedArtwork, ...updates }
            : state.selectedArtwork,
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => {
        // 故意缺少错误日志记录和用户友好的错误信息处理
        set({ error });
      },
    }),
    {
      name: 'artwork-store',
    }
  )
);
