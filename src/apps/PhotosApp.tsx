import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid,
  Heart,
  Image as ImageIcon,
  Share,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { useOS } from '../system/OSContext';
import { NavBar, TabBar } from '../ui/kit';
import { GLASS } from '../system/tokens';

const seedPhotos = [...Array(30)].map((_, i) => i);

// All four tabs have real panes; the viewer supports favorite, share (toast)
// and delete which removes the photo from the grid.
const PhotosApp: React.FC = () => {
  const { t, pushToast } = useOS();
  const [tab, setTab] = useState('library');
  const [photos, setPhotos] = useState(seedPhotos);
  const [favs, setFavs] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);

  const toggleFav = (i: number) =>
    setFavs((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const remove = (i: number) => {
    setPhotos((p) => p.filter((x) => x !== i));
    setSelected(null);
    pushToast(t('toast.photoDeleted'));
  };

  const grid = (
    <div className="px-1 grid grid-cols-3 gap-1">
      {photos.map((i) => (
        <motion.div
          layoutId={`photo-${i}`}
          key={i}
          onClick={() => setSelected(i)}
          className={`relative bg-gray-200 overflow-hidden cursor-pointer ${
            i % 12 === 0 ? 'col-span-3 aspect-video rounded-[20px] mx-1 mb-1 shadow-sm' : 'aspect-square'
          }`}
        >
          <img
            src={`https://picsum.photos/seed/${i + 130}/400/400`}
            alt=""
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          {favs.has(i) && <Heart size={14} className="absolute bottom-1.5 right-1.5 text-white fill-white drop-shadow" />}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      <NavBar title={t('app.photos')} large actionIcon={Search} onAction={() => setTab('search')} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
        {tab === 'library' && (
          <>
            <div className="px-6 mb-8">
              <div className="text-sm font-bold text-black/30 uppercase tracking-wider mb-3">{t('photos.memories')}</div>
              <div className="w-full h-48 rounded-[28px] overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-gray-100">
                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
                  <div className="text-white font-bold text-2xl drop-shadow-md">Yosemite Trip</div>
                  <div className="text-white/80 text-sm font-medium">October 12</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3 mb-4">
              {[t('photos.years'), t('photos.months'), t('photos.days'), t('photos.all')].map((x, i) => (
                <div
                  key={x}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-gray-100 ${
                    i === 3 ? 'bg-white text-black' : 'text-black/40 bg-white/40'
                  }`}
                >
                  {x}
                </div>
              ))}
            </div>
            {grid}
          </>
        )}

        {tab === 'foryou' && (
          <div className="px-6 space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-[28px] overflow-hidden relative h-52 shadow-sm border border-gray-100">
                <img src={`https://picsum.photos/seed/${i + 300}/600/400`} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
                  <div className="text-white/70 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} /> {t('photos.memories')}
                  </div>
                  <div className="text-white font-bold text-xl">{i === 1 ? 'Yosemite Trip' : 'City Nights'}</div>
                  <div className="text-white/70 text-xs">{24 + i * 3} {t('photos.items')}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'albums' && (
          <div className="px-6 grid grid-cols-2 gap-4">
            {['Recents', 'Favorites', 'Travel', 'People'].map((name, i) => (
              <div key={name} className="space-y-2">
                <div className="aspect-square rounded-[24px] overflow-hidden bg-gray-200 shadow-sm border border-gray-100">
                  <img src={`https://picsum.photos/seed/${i + 400}/300/300`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="font-semibold text-black/80 text-sm pl-1">{name}</div>
                <div className="text-xs text-black/40 pl-1 -mt-1">{12 + i * 7}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'search' && (
          <div className="px-6">
            <SearchBox id="photos.search" placeholder={t('common.search')} />
            <div className="text-xs font-bold text-black/30 uppercase tracking-wider mt-6 mb-3">{t('photos.all')}</div>
            {grid}
          </div>
        )}
      </div>

      <TabBar
        activeTab={tab}
        onTabChange={setTab}
        tabs={[
          { id: 'library', label: t('photos.library'), icon: Grid },
          { id: 'foryou', label: t('photos.forYou'), icon: Heart },
          { id: 'albums', label: t('photos.albums'), icon: ImageIcon },
          { id: 'search', label: t('common.search'), icon: Search },
        ]}
      />

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center"
            onClick={() => setSelected(null)}
          >
            <motion.img
              layoutId={`photo-${selected}`}
              src={`https://picsum.photos/seed/${selected + 130}/800/800`}
              alt=""
              className="w-full max-h-full object-contain shadow-2xl"
            />
            <div className="absolute top-14 right-5 flex gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => toggleFav(selected)}
                aria-label="Favorite"
                className={`p-3 rounded-full ${GLASS.button} ${favs.has(selected) ? 'text-red-400' : 'text-white'}`}
              >
                <Heart size={20} className={favs.has(selected) ? 'fill-red-400' : ''} />
              </button>
              <button onClick={() => pushToast(t('toast.shared'))} aria-label="Share" className={`p-3 rounded-full ${GLASS.button} text-white`}>
                <Share size={20} />
              </button>
              <button onClick={() => remove(selected)} aria-label="Delete" className={`p-3 rounded-full ${GLASS.button} text-red-400`}>
                <Trash2 size={20} />
              </button>
            </div>
            <button onClick={() => setSelected(null)} aria-label="Close" className={`absolute top-14 left-5 p-3 rounded-full ${GLASS.button} text-white`}>
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Shared lightweight search field that drives the system keyboard.
export const SearchBox: React.FC<{ id: string; placeholder: string; onSubmit?: () => void }> = ({
  id,
  placeholder,
  onSubmit,
}) => {
  const { registerInput, unregisterInput, openKeyboard } = useOS();
  const [value, setValue] = useState('');
  const ref = React.useRef(value);
  ref.current = value;

  React.useEffect(() => {
    registerInput(id, { get: () => ref.current, set: setValue, onSubmit, placeholder });
    return () => unregisterInput(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      onClick={() => openKeyboard(id)}
      className="w-full h-11 bg-white shadow-sm border border-gray-100 rounded-[14px] flex items-center px-3 gap-2 text-gray-400 text-left"
    >
      <Search size={16} />
      <span className={`text-sm truncate ${value ? 'text-black/80 font-medium' : ''}`}>{value || placeholder}</span>
    </button>
  );
};

export default PhotosApp;
