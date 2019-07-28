import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
} from '../index';

function imageBase64(image: Blob): Source<string> {
  // @ts-ignore
  return (start: CallbagType, sink: Sink<string>) => {
    if (start === CALLBAG_START) {
      const fileReader = new FileReader();
      const handleLoadend = () => {
        sink(CALLBAG_RECEIVE, fileReader.result as string);
        sink(CALLBAG_FINISHING);
      };

      const handleError = (error: any) => {
        sink(CALLBAG_FINISHING, error);
      };

      const talkback = (type: CallbagType) => {
        if (type === CALLBAG_FINISHING) {
          fileReader.removeEventListener('loadend', handleLoadend);
          fileReader.removeEventListener('error', handleError);
        }
      };
      sink(CALLBAG_START, talkback);

      fileReader.addEventListener('loadend', handleLoadend);
      fileReader.addEventListener('error', handleError);

      fileReader.readAsDataURL(image);
    }
  };
}

export default imageBase64;
