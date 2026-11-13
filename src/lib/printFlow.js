import { useApp, movieById } from '../store.js';
import { capturePhoto, savePhoto } from './photos.js';

/** Take a photo of the current frame and keep it. Returns the photo or null. */
export async function snapPhoto() {
  const s = useApp.getState();
  const movie = movieById(s.insertedTapeId);
  try {
    const photo = await capturePhoto({ video: s.videoEl, borderId: s.borderId, movie });
    const saved = await savePhoto(photo);
    useApp.getState().addPhoto(photo);
    const n = useApp.getState().sessionPhotos.length;
    s.announce(
      saved
        ? `Photo ${n} saved at ${photo.timecode}.`
        : `Photo ${n} taken. This browser can’t store it, so download it before you leave.`,
    );
    return photo;
  } catch (err) {
    s.announce(err?.message || 'The photo couldn’t be taken.');
    return null;
  }
}

/**
 * Print this tape's photos. If nothing was captured, the booth takes one
 * last photo of the current frame so there is always something to print.
 */
export async function printPhotos() {
  const s = useApp.getState();
  if (s.printing) return;
  let photos = s.sessionPhotos.slice(-8);
  if (!photos.length) {
    const p = await snapPhoto();
    if (!p) return;
    photos = [p];
  }
  const video = useApp.getState().videoEl;
  if (video && !video.paused) video.pause();
  useApp.getState().startPrint(photos);
}
