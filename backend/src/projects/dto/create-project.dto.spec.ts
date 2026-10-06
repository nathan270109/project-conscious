import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProjectDto } from './create-project.dto.js';

describe('CreateProjectDto — entrada normalizada', () => {
  const valid = { name: 'Projeto', repositoryUrl: 'https://github.com/octocat/Hello-World' };
  it('normaliza textos sem substituir os dados por tipos diferentes', async () => {
    const dto = plainToInstance(CreateProjectDto, { name: '  Projeto  ', repositoryUrl: ` ${valid.repositoryUrl} `, description: '  Descrição  ' });
    expect(await validate(dto)).toEqual([]);
    expect(dto).toMatchObject({ ...valid, description: 'Descrição' });
  });
  it.each([
    { name: '   ' }, { name: ' ab ' }, { name: 'x'.repeat(101) }, { name: 123 },
    { description: 'x'.repeat(2001) }, { description: {} },
    { repositoryUrl: 'https://example.com/owner/repo' },
    { repositoryUrl: 'https://github.com/user/repo/tree/master' },
    { repositoryUrl: 'https://user:secret@github.com/user/repo' },
    { repositoryUrl: 'https://github.com:443/user/repo' },
    { repositoryUrl: 'https://github.com/user/repo?x=1' },
    { repositoryUrl: 'https://github.com/user/repo#readme' },
    { repositoryUrl: 'https://github.com/a/../repo' },
    { repositoryUrl: null }, { repositoryUrl: 'x'.repeat(2049) },
  ])('recusa entrada inválida: %j', async patch => {
    expect((await validate(plainToInstance(CreateProjectDto, { ...valid, ...patch }))).length).toBeGreaterThan(0);
  });
  it('aceita os limites e descrição ausente', async () => {
    expect(await validate(plainToInstance(CreateProjectDto, { ...valid, name: 'x'.repeat(100), description: 'x'.repeat(2000) }))).toEqual([]);
    expect(await validate(plainToInstance(CreateProjectDto, valid))).toEqual([]);
  });
});
