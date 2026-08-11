const fs = require('fs');
const path = require('path');
const expect = require('expect.js');
const themeColor = require('../public/source/theme-color');

describe('theme graph colors', () => {
  it('generates deterministic theme-specific colors', () => {
    const ref = 'refs/heads/feature/theme-support';
    expect(themeColor.colorForRef(ref, 'dark')).to.be(themeColor.colorForRef(ref, 'dark'));
    expect(themeColor.colorForRef(ref, 'light')).to.be(themeColor.colorForRef(ref, 'light'));
    expect(themeColor.colorForRef(ref, 'dark')).not.to.be(themeColor.colorForRef(ref, 'light'));
  });

  for (const theme of ['dark', 'light']) {
    it(`keeps generated ${theme} colors above the graph contrast target`, () => {
      const background = themeColor.GRAPH_COLORS[theme].background;
      for (let index = 0; index < 2000; index++) {
        const color = themeColor.colorForRef(`refs/heads/test-${index}`, theme);
        expect(color).to.match(/^#[0-9a-f]{6}$/);
        expect(themeColor.contrastRatio(color, background)).to.be.above(
          themeColor.MIN_GRAPH_CONTRAST - Number.EPSILON
        );
      }
    });
  }

  it('keeps fixed graph colors above the contrast target', () => {
    for (const theme of ['dark', 'light']) {
      const colors = themeColor.GRAPH_COLORS[theme];
      for (const colorName of ['edge', 'fallback']) {
        expect(themeColor.contrastRatio(colors[colorName], colors.background)).to.be.above(
          themeColor.MIN_GRAPH_CONTRAST - Number.EPSILON
        );
      }
    }
  });

  it('uses the active LESS background for graph contrast calculations', () => {
    for (const theme of ['dark', 'light']) {
      const less = fs.readFileSync(
        path.join(__dirname, `../public/less/themes/${theme}.less`),
        'utf8'
      );
      const bodyBackground = less.match(/^@body-bg:\s*(#[0-9a-f]{6});/im);
      expect(bodyBackground).to.be.ok();
      expect(bodyBackground[1].toLowerCase()).to.be(themeColor.GRAPH_COLORS[theme].background);
      expect(themeColor.GRAPH_COLORS[theme].accent).to.be(bodyBackground[1].toLowerCase());
    }
  });
});
