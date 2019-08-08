import { Source } from '../index';
import { createSource } from './';

function imageBase64Func(image: Blob) {
  return (next: (result: string) => void, complete: () => void, error: (err: any) => void) => {
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
  };
}

function imageBase64(image: Blob): Source<string> {
  return createSource(imageBase64Func(image));
}

export default imageBase64;
