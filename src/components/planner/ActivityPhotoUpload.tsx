import React, { useState, useRef } from 'react'
import { Button } from '../ui/Button'

interface ActivityPhotoUploadProps {
  activity_id: string
  existing_photos?: string[]
  on_photos_change: (photos: string[]) => void
  max_photos?: number
  className?: string
}

export const ActivityPhotoUpload: React.FC<ActivityPhotoUploadProps> = ({
  activity_id,
  existing_photos = [],
  on_photos_change,
  max_photos = 5,
  className = ''
}) => {
  const [photos, set_photos] = useState<string[]>(existing_photos)
  const [uploading, set_uploading] = useState(false)
  const file_input_ref = useRef<HTMLInputElement>(null)

  const handle_file_select = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    if (photos.length + files.length > max_photos) {
      alert(`ניתן להעלות עד ${max_photos} תמונות לכל פעילות`)
      return
    }

    set_uploading(true)

    try {
      const new_photos: string[] = []

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`הקובץ ${file.name} אינו תמונה חוקית`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`הקובץ ${file.name} גדול מדי. גודל מקסימלי: 5MB`)
          continue
        }

        // Convert to base64 for local storage
        const base64 = await file_to_base64(file)
        new_photos.push(base64)
      }

      const updated_photos = [...photos, ...new_photos]
      set_photos(updated_photos)
      on_photos_change(updated_photos)

    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('שגיאה בהעלאת התמונות')
    } finally {
      set_uploading(false)
      // Clear the input
      if (file_input_ref.current) {
        file_input_ref.current.value = ''
      }
    }
  }

  const handle_remove_photo = (index: number) => {
    const updated_photos = photos.filter((_, i) => i !== index)
    set_photos(updated_photos)
    on_photos_change(updated_photos)
  }

  const file_to_base64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handle_upload_click = () => {
    file_input_ref.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {photos.length}/{max_photos} תמונות
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handle_upload_click}
            disabled={uploading || photos.length >= max_photos}
            className="text-sm"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                מעלה...
              </div>
            ) : (
              <>
                📷 הוסף תמונות
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={file_input_ref}
        type="file"
        accept="image/*"
        multiple
        onChange={handle_file_select}
        className="hidden"
      />

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`תמונה ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              
              {/* Remove button */}
              <button
                onClick={() => handle_remove_photo(index)}
                className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="הסר תמונה"
              >
                ✕
              </button>

              {/* Photo number */}
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">אין תמונות לפעילות זו</p>
          <button
            onClick={handle_upload_click}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            הוסף תמונות מהמכשיר
          </button>
        </div>
      )}

      {/* Upload guidelines */}
      <div className="text-xs text-gray-500">
        <p>• תמונות בפורמט JPG, PNG או GIF</p>
        <p>• גודל מקסימלי: 5MB לכל תמונה</p>
        <p>• עד {max_photos} תמונות לכל פעילות</p>
      </div>
    </div>
  )
}