import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  /**
   * Constructs the full URL for a product image
   * @param pictureUrl The relative path from the API (e.g., "/images/products/filename.jpg")
   * @returns The full URL to the image
   */
  getProductImageUrl(pictureUrl: string): string {
    if (!pictureUrl) {
      return '';
    }

    // If it's already a full URL, use it as is
    if (pictureUrl.startsWith('http://') || pictureUrl.startsWith('https://')) {
      return pictureUrl;
    }

    // If it's a data URL, use it as is
    if (pictureUrl.startsWith('data:')) {
      return pictureUrl;
    }

    // Construct the full URL using API server
    // Always use the API server URL for images since they are served from there
    const apiBaseUrl = 'https://localhost:5001/';
    
    let imagePath = pictureUrl;
    
    // Ensure it starts with a slash
    if (!imagePath.startsWith('/')) {
      imagePath = `/${imagePath}`;
    }

    // Add cache-busting parameter to force reload
    const timestamp = new Date().getTime();
    return `${apiBaseUrl}${imagePath}?t=${timestamp}`;
  }

  /**
   * Gets a placeholder image URL for when product images fail to load
   * @returns Base64 encoded SVG placeholder
   */
  getPlaceholderImageUrl(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
}
