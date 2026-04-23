interface Tag {
  label: string;
  color: string;
}

interface CountryCardProps {
  name: string;
  image: string;
  rating?: number;
  description: string;
  tags?: Tag[];
}

export function CountryCard({
  name,
  image,
  rating,
  description,
  tags,
}: CountryCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {rating !== undefined && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 text-xs font-bold text-yellow-500">
            ★ {rating?.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-bold text-gray-900 text-sm mb-1">{name}</h3>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {tags?.map((tag) => (
            <span
              key={tag.label}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
