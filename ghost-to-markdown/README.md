## Install dependencies

```bash
npm install
```

## Download posts

### Download `all` posts

```bash
npm run download
```
### Download `all`  posts by author

```bash
npm run download -- --author-slug=<ghost-author-slug>
```

### Download posts by author and post type
```bash
npm run download -- --author-slug=<ghost-author-slug> --post-type=draft
```

```bash
npm run download -- --author-slug=<ghost-author-slug> --post-type=published
```

```bash
npm run download -- --author-slug=<ghost-author-slug> --post-type=all # default
```

### Batch size (default: 25)

```bash
npm run download -- --batch-size=50 ...other-args
```

## Upload posts

```bash
npm run upload -- --ghost-slug=<ghost-author-slug> --hashnode-slug=<hashnode-author-slug> --post-type=draft
```

```bash
npm run upload -- --ghost-slug=<ghost-author-slug> --hashnode-slug=<hashnode-author-slug> --post-type=published
```

```bash
npm run upload -- --ghost-slug=<ghost-author-slug> --hashnode-slug=<hashnode-author-slug> --post-type=all # default
```
