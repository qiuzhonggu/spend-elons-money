import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const productsPath = resolve('src/data/products.json')
const outputDirectory = resolve('public/products')
const products = JSON.parse(readFileSync(productsPath, 'utf8'))
const downloaded = new Map()

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`${command} 执行失败，退出码 ${result.status ?? 'unknown'}`)
  }
}

function assertWebP(path) {
  const header = readFileSync(path).subarray(0, 12)
  if (header.subarray(0, 4).toString() !== 'RIFF' || header.subarray(8, 12).toString() !== 'WEBP') {
    throw new Error(`${path} 不是有效的 WebP 文件`)
  }
}

if (products.every((product) => product.image === `/products/${product.id}.webp`)) {
  for (const product of products) {
    assertWebP(join(outputDirectory, `${product.id}.webp`))
  }
  process.stdout.write(`本地资源校验完成：${products.length}/${products.length}。\n`)
  process.exit(0)
}

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'spend-images-'))

try {
  mkdirSync(outputDirectory, { recursive: true })

  for (const [index, product] of products.entries()) {
    let sourcePath = downloaded.get(product.image)
    if (!sourcePath) {
      sourcePath = join(temporaryDirectory, `source-${downloaded.size}`)
      run('curl', [
        '--fail',
        '--fail-early',
        '--silent',
        '--show-error',
        '--location',
        '--retry',
        '3',
        '--output',
        sourcePath,
        product.image,
      ])
      downloaded.set(product.image, sourcePath)
    }

    const outputPath = join(outputDirectory, `${product.id}.webp`)
    run('cwebp', ['-quiet', '-resize', '800', '0', '-q', '82', sourcePath, '-o', outputPath])
    assertWebP(outputPath)
    process.stdout.write(`\r已处理 ${index + 1}/${products.length}`)
  }

  process.stdout.write(`\n完成：${downloaded.size} 个下载源，${products.length} 个商品文件。\n`)
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true })
}
