import { getInfo } from '@bigfive-org/results';

describe('getInfo', () => {
  it('should return the correct languages', () => {
    const info = getInfo();
    expect(info.languages).toContainEqual({ code: 'ko', name: 'Korean' });
    // Add more assertions as needed
  });
});
