import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Can, PermissionsProvider } from './can';

describe('Can', () => {
  it('tiêu chí 3: thiếu quyền stage.close → không render con', () => {
    render(
      <PermissionsProvider permissions={{ 'batch.view': { scope: 'all' } }}>
        <Can perm="stage.close">
          <button type="button">Chốt</button>
        </Can>
      </PermissionsProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Chốt' })).toBeNull();
  });

  it('có quyền → render con', () => {
    render(
      <PermissionsProvider permissions={{ 'stage.close': { scope: 'own' } }}>
        <Can perm="stage.close">
          <button type="button">Chốt</button>
        </Can>
      </PermissionsProvider>,
    );
    expect(screen.getByRole('button', { name: 'Chốt' })).toBeInTheDocument();
  });

  it('phạm vi không đủ → hiện fallback', () => {
    render(
      <PermissionsProvider permissions={{ 'record.edit': { scope: 'own' } }}>
        <Can perm="record.edit" scope="all" fallback={<span>khoá</span>}>
          <button type="button">Sửa</button>
        </Can>
      </PermissionsProvider>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('khoá')).toBeInTheDocument();
  });

  it('không có provider → coi như không có quyền', () => {
    render(
      <Can perm="stage.close">
        <span>x</span>
      </Can>,
    );
    expect(screen.queryByText('x')).toBeNull();
  });
});
