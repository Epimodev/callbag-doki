import { Source } from '../index';
import { createSource } from './';

function imageBase64(image: Blob): Source<string> {
  return createSource((next, complete, error) => {
    const fileReader = new FileReader();
    const handleLoadend = () => {
      next(fileReader.result as string);
      complete();
    };

    const handleError = (err: any) => {
      error(err);
    };

    fileReader.addEventListener('loadend', handleLoadend);
    fileReader.addEventListener('error', handleError);

    fileReader.readAsDataURL(image);

    return () => {
      fileReader.removeEventListener('loadend', handleLoadend);
      fileReader.removeEventListener('error', handleError);
    };
  });
}

export default imageBase64;
