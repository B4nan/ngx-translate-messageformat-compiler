import * as MessageFormat from 'messageformat';
import { TranslateMessageFormatCompiler } from './translate-message-format-compiler';

describe('TranslateMessageFormatCompiler', () => {
  let compiler: TranslateMessageFormatCompiler;
  let messageFormat: any;
  let mfCompile: jasmine.Spy;

  beforeEach(() => {
    messageFormat = new MessageFormat();
    mfCompile = spyOn(messageFormat, 'compile').and.callThrough();
  });

  describe('constructor', () => {
    it('should use messageformat to compile the nested translations object', () => {
      expect(() => new TranslateMessageFormatCompiler(undefined))
        .toThrowError(/^Not\ a\ messageformat\ instance:/);

      expect(() => new TranslateMessageFormatCompiler({}))
        .toThrowError(/^Not\ a\ messageformat\ instance:/);

      expect(() => new TranslateMessageFormatCompiler({ compile: 'foo' }))
        .toThrowError(/^Not\ a\ messageformat\ instance:/);
    });
  });

  describe('compile', () => {
    let icuString: string;

    beforeEach(() => {
      compiler = new TranslateMessageFormatCompiler(messageFormat);
      icuString = '{count, plural, =0{No} one{A} other{Several}} {count, plural, one{word} other{words}}';
    });

    it('should use messageformat to compile the passed string', () => {
      compiler.compile(icuString, 'en');
      expect(mfCompile).toHaveBeenCalledWith(icuString, 'en');
    });

    it('should return the compilation function', () => {
      const result = compiler.compile(icuString, 'en') as Function;
      expect(result({ count: 1 })).toBe('A word');
    });
  });

  describe('compileTranslations', () => {
    let translations: Object;

    beforeEach(() => {
      compiler = new TranslateMessageFormatCompiler(messageFormat);
      translations = {
        alpha: {
          one: '{count, plural, =0{No} one{A} other{Several}} {count, plural, one{word} other{words}}',
          two: '{gender, select, male{He is} female{She is} other{They are}} {how}'
        }
      };
    });

    it('should use messageformat to compile the nested translations object', () => {
      compiler.compileTranslations(translations, 'en');
      expect(mfCompile).toHaveBeenCalledWith(translations, 'en');
    });

    it('should return a corresponding object of compilation functions', () => {
      const result = compiler.compileTranslations(translations, 'en');
      expect(result.alpha.one({ count: 1 })).toBe('A word');
      expect(result.alpha.two({ gender: 'female', how: 'cool' })).toBe('She is cool');
    });
  });
});
