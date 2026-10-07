import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  title: string;
  imageUrl: string;
  key?: string | number;
}

export default function ProductCard({ id, title, imageUrl }: ProductCardProps) {
  return (
    <div className="mb-2 md:mb-6 single-game-product-2 bg-white rounded-[10px] border border-[#dddde7] shadow-[0.5px_2px_0_-1px_var(--color-primary-500)] overflow-hidden relative w-full">
      <Link to={`/topup/${id}/null`} className="group block">
        <div className="cursor-pointer">
          <div className="inset-0 transform group-hover:scale-95 transition duration-300">
            <div className="h-full w-full text-center mx-auto">
              <img
                src={imageUrl || "https://admin.evotopup.com/products/1754589287.jpeg"}
                alt={title}
                className="w-full aspect-square object-cover rounded-md"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
        <div className="w-full h-12 flex items-center justify-center">
          <h1 className="capitalize text-xs text-center font-primary font-normal text-secondary-500 px-2 break-words leading-tight" title={title}>
            {title}
          </h1>
        </div>
      </Link>
    </div>
  );
}
