module.exports = {
  buffer: true,
  
  recording: {
    width: 127,
    height: 102,
    thickness: 2.4
  },
  display: {
    width: 196.608,
    height: 147.456,
    thickness: 1,

    zDistance: 100,

    resolution: {
      width: 2048,
      height: 1536
    }
  },
  slit: {
    width: 127 * 3,
    height: 102,
    thickness: 2.4,
    zDistance: 50,
    apeture: {
      offset: {
        x: 127 - 5,
        y: 5
      },
      width: 5
    }
  }
};
