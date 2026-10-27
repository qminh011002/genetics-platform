// @genetics/shared: kế thừa config gốc; package này không có JSX / React.
import base from '../../eslint.config.base.js';

export default [...base, { ignores: ['dist/**'] }];
