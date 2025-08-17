import { useState, useCallback } from 'react';
const test1 = '/static/test-1.png'
const test2 = '/static/test-2.png'
const test3 = '/static/test-3.png'
const test4 = '/static/test-4.png'
const test5 = '/static/test-5.png'
const test6 = '/static/test-6.png'
const taylor = '/static/tumblr_a69991aebb9f5d5e0e2ea7b11cd92835_af3c364b_540.jpg'

function App() {
  const [analysis, setAnalysis] = useState(`
    <div class="mt-10">
      <h3>Analyse Mode Professionnelle</h3>
      <h4>Description des Éléments Vestimentaires</h4>

      <p>L'image présente une tenue composée de plusieurs éléments distincts, chacun contribuant à un look sophistiqué et moderne. Voici une analyse détaillée des pièces vestimentaires :</p>
      <br/>
      <h3>1. Veste en Tweed :</h3>
      <ul class="list-disc list-inside">
        <li><strongCouleur</strong> : Noir et blanc.</li>
        <li><strong>Motif</strong> : Motif à carreaux, typique du tweed.</li>
        <li><strong>Matière</strong> : Tweed, un tissu épais et texturé, souvent associé à des vêtements d'extérieur élégants.</li>
        <li><strong>Coupe</strong> : La veste est oversize, avec des manches larges et une coupe ample, offrant un style décontracté mais chic.</li>
      </ul>
      <br/>
      <h3>2. Robe Noire :</h3>
      <ul class="list-disc list-inside">
        <li><strong>Couleur</strong> : Noir.</li>
        <li><strong>Motif</strong> : Uni.</li>
        <li><strong>Matière</strong> : Probablement un tissu léger et fluide, comme du satin ou de la soie.</li>
        <li><strong>Coupe</strong> : La robe est courte, avec une fermeture éclair visible sur le devant, ajoutant une touche de modernité.</li>
      </ul>
      <br/>
      <h3>3. Ceinture à Perles :</h3>
      <ul class="list-disc list-inside">
        <li><strong>Couleur</strong> : Blanc.</li>
        <li><strong>Motif</strong> : Perles.</li>
        <li><strong>Matière</strong> : Perles, probablement en plastique ou en verre.</li>
        <li><strong>Coupe</strong> : La ceinture est portée autour de la taille, ajoutant une touche de sophistication et de féminité à la tenue.</li>
      </ul>
      <br/>
      <h3>Articles Similaires :</h3>

      <ul class="list-disc list-inside">
        <li><strong>Veste en Tweed Masculine Versace</strong> (3 350,00 \$) : <a href="https://go.shopmy.us/p-9556602" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9556602</a></li>
        <li><strong>Boucles d'Oreilles Chatelaine Heart en Grenat de David Yurman</strong> (800,00 \$) : <a href="https://go.shopmy.us/p-9646501" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9646501</a></li>
        <li><strong>Corset en Soie Classique de Victoria's Secret</strong> (34,99 \$) : <a href="https://go.shopmy.us/p-9559444" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9559444</a></li>
        <li><strong>Montre Tambour de Louis Vuitton</strong> (54 000,00 \$) : <a href="https://go.shopmy.us/p-9560887" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9560887</a></li>
        <li><strong>Bague Héritage en Rubis et Diamant de Retrouvai</strong> (32 970,00 \$) : <a href="https://go.shopmy.us/p-9571612" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9571612</a></li>
        <li><strong>Bague Ruby Royale en Rubis et Diamant de Effy Jewelry</strong> (3 060,00 \$) : <a href="https://go.shopmy.us/p-9571596" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9571596</a></li>
        <li><strong>Bague Petite Pavé Pinky de David Yurman</strong> (2 400,00 \$) : <a href="https://go.shopmy.us/p-9646708" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9646708</a></li>
        <li><strong>Jupe Mini en Tweed de Versace</strong> (1 695,00 \$) : <a href="https://go.shopmy.us/p-9556710" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9556710</a></li>
        <li><strong>Sac à Main Medusa 95 de Versace</strong> (2 190,00 \$) : <a href="https://go.shopmy.us/p-9557768" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9557768</a></li>
        <li><strong>Bottes en Cuir Medusa 95 de Versace</strong> (1 990,00 \$) : <a href="https://go.shopmy.us/p-9557768" target="_blank" rel="noopener noreferrer">https://go.shopmy.us/p-9557768</a></li>
      </ul>
    </div>
  `)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))

    if (imageFile) {
      setUploadedImage({
        file: imageFile,
        url: URL.createObjectURL(imageFile),
        name: imageFile.name
      })
    }
  }, [])

  const handleImage = useCallback(async (image) => {
    // Convertir l'image de test en File object
    const response = await fetch(image)
    const blob = await response.blob()
    const name = image.split('/').pop().split('.')[0] + '.png'

    // Créer un File object avec un nom approprié
    const file = new File([blob], name, { type: 'image/png' })

    // Créer l'URL et définir l'image
    const url = URL.createObjectURL(file)
    setUploadedImage({
      file,
      url,
      name
    })
  }, [])

  const test = `
    ### Analyse Mode Professionnelle #### Description des Éléments Vestimentaires La tenue présentée sur l'image se compose des éléments suivants : 1. **Robe Noire** : - **Couleur** : Noire. - **Matière** : Probablement un tissu léger et fluide, tel que le polyester ou un mélange de fibres synthétiques. - **Coupe** : Sans manches, avec un décolleté rond et une longueur au-dessus du genou. 2. **Ceinture** : - **Couleur** : Noire avec une boucle dorée. - **Matière** : Cuir ou similicuir. - **Détails** : Une chaîne dorée est attachée à la ceinture, ajoutant une touche de sophistication. 3. **Collier** : - **Couleur** : Doré. - **Matière** : Métal doré, probablement de l'or ou un alliage doré. - **Design** : Un pendentif en forme de cercle avec une chaîne assortie. 4. **Lunettes** : - **Couleur** : Monture noire. - **Matière** : Plastique ou acétate. - **Design** : Monture épaisse et rectangulaire. 5. **Bague** : - **Couleur** : Dorée. - **Matière** : Métal doré, probablement de l'or ou un alliage doré. - **Design** : Bague fine avec un petit diamant. #### Analyse des Couleurs et Motifs - **Couleurs** : La tenue est dominée par le noir, avec des accents dorés apportés par les accessoires. Cette combinaison de couleurs crée un look élégant et sophistiqué. - **Motifs** : Aucun motif visible sur la robe ou les accessoires. Le design est minimaliste et épuré. #### Analyse des Matières - **Robe** : Le tissu semble léger et fluide, idéal pour une tenue de soirée ou un événement formel. - **Ceinture** : Le cuir ou similicuir ajoute une touche de luxe et de durabilité. - **Accessoires** : Les éléments dorés en métal apportent une touche de brillance et de sophistication. ### Articles Similaires Il est important de noter que les articles suivants sont similaires mais pas nécessairement identiques à ceux présentés sur l'image. - **Lunettes ‘Little Dinger Glasses’ de Chrome Hearts** (1639,00€) : https://go.shopmy.us/p-21755955 - **Ceinture en Cuir ‘Phoenix Leather Belt’ de B Low The Belt** (\$155.00) : https://go.shopmy.us/p-21759996 - **Bague en Or et Diamant ‘Tattoo Gold Diamond Ring’ de Ofira** (\$3,400.00) : https://go.shopmy.us/p-21759988 - **Collier Vintage ‘Vintage 1970s Ancient Bronze Coin Necklace’ de For Future Reference** (\$10,940) : https://go.shopmy.us/p-21760010 Ces articles peuvent être utilisés pour recréer un look similaire tout en offrant des options de personnalisation et de style.
  `

  const convertMarkdownToHtml = (text) => {
    return text
      .replace(/#### (.*?)(?=\n|$|####|###)/g, '<h3>$1</h3>')
      .replace(/### (.*?)(?=\n|$|####|###)/g, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(<h[23]>.*?)(?=<h[23]>|$)/g, '$1')
  }

  console.log(test)
  console.log(convertMarkdownToHtml(test))



  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))

    if (imageFile) {
      setUploadedImage({
        file: imageFile,
        url: URL.createObjectURL(imageFile),
        name: imageFile.name
      })
    }
  }, [])

  const removeImage = useCallback(() => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.url)
      setUploadedImage(null)
    }
  }, [uploadedImage])

  const analyzeImage = useCallback(async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()

      const imageFile = uploadedImage.file
      formData.append('image', imageFile)

      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setAnalysis(data.message)
    } catch (error) {
      setAnalysis(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [uploadedImage])

  const ImageNumber = ({ index }) => (
    <div className="absolute top-2 right-2 w-6 h-6 bg-white text-black flex items-center justify-center rounded-full text-xs">{index}</div>
  )

  return (
    <main className="mt-24">
      <header className="relative w-full mx-4 pt-14">
        <p className="logo">
          FASHION STYLE<br/> ANALYZER
        </p>
        <button className="absolute -top-18 right-8 flex items-center gap-2">
          Github
          <svg
            className="w-6 h-6 -ml-2 -mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </button>
        <h1 className="text-center mt-10 z-20">Fashion style analyzer</h1>
      </header>

      <div className="mx-auto max-w-3xl mt-10">
        <h2 className="text-center font-medium mb-13">Ce système IA analyse les tenues et recommande un style augmenté façon Taylor Swift.</h2>
      </div>

      <div className="mx-auto max-w-2xl mt-10">
        <div className="border border-white p-4 rounded-lg text-sm">
          <h4 className="text-sm">À propos de cette application :</h4>
          <ul className="list-disc list-inside text-xs">
            <li><strong>Encodage d'image</strong> : Conversion des images de mode en vecteurs numériques</li>
            <li><strong>Recherche de similarité</strong> : Recherche d'articles visuellement similaires dans une base de données</li>
            <li><strong>IA avancée</strong> : Génération de descriptions détaillées des éléments de mode</li>
          </ul>
          <p className="text-xs">L'analyseur identifie les vêtements, tissus, couleurs et détails de style à partir des images.
          La base de données inclut des informations sur les tenues avec marques et prix.</p>
        </div>
      </div>

      <div className="w-full max-w-8xl mx-auto mt-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          <div className={`relative mb-16 ${uploadedImage ? 'grayscale' : ''}`}>
            <ImageNumber index={1} />
            <img src={test1} alt="test1" className="w-full h-full min-h-[510px] rounded-lg object-cover" />
            <button onClick={() => handleImage(test1)}>Sélectionner</button>
          </div>
          <div className={`relative mb-16 ${uploadedImage ? 'grayscale' : ''}`}>
            <ImageNumber index={2} />
            <img src={test2} alt="test2" className="w-full h-full min-h-[510px] rounded-lg object-cover" />
            <button onClick={() => handleImage(test2)}>Sélectionner</button>
          </div>
          <div className={`relative mb-16 ${uploadedImage ? 'grayscale' : ''}`}>
            <ImageNumber index={3} />
            <img src={test3} alt="test3" className="w-full h-full min-h-[510px] rounded-lg object-cover" />
            <button onClick={() => handleImage(test3)}>Sélectionner</button>
          </div>
          <div className={`relative mb-16 ${uploadedImage ? 'grayscale' : ''}`}>
            <ImageNumber index={4} />
            <img src={test4} alt="test4" className="w-full h-full min-h-[510px] rounded-lg object-cover" />
            <button onClick={() => handleImage(test4)}>Sélectionner</button>
          </div>
          <div className={`relative mb-16 ${uploadedImage ? 'grayscale' : ''}`}>
            <ImageNumber index={5} />
            <img src={test5} alt="test5" className="w-full h-full min-h-[510px] rounded-lg object-cover" />
            <button onClick={() => handleImage(test5)}>Sélectionner</button>
          </div>
          <div className={`relative mb-16 ${uploadedImage ? 'grayscale' : ''}`}>
            <ImageNumber index={6} />
            <img src={test6} alt="test6" className="w-full h-full min-h-[510px] rounded-lg object-cover" />
            <button onClick={() => handleImage(test6)}>Sélectionner</button>
          </div>
          <div className="relative mb-16">
            {uploadedImage ? (
              <div className="relative w-full h-full">
                <div className="absolute top-2 right-2 w-6 h-6 bg-white text-black flex items-center justify-center rounded-full text-xs cursor-pointer" onClick={removeImage}>X</div>
                <img src={uploadedImage.url} alt={uploadedImage.name} className="w-full h-full min-h-[510px] rounded-lg object-cover" />
                <button className="secondary" onClick={analyzeImage}>Analyser</button>
              </div>
            ) : (
              <div className={`w-full h-full min-h-[510px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 px-2 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="font-medium text-gray-200 dark:text-white mb-2">
                  Glissez et déposez votre image ici
                </div>
                <p className="text-gray-500 mb-4">
                  ou cliquez pour sélectionner votre fichier
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Sélectionner une image
                </label>
              </div>
             )}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-2xl mt-12">
        <h3>Tenue trouvée la plus proche :</h3>
        <img src={taylor} alt="taylor" className="w-[400px] h-[400px] my-4 rounded-lg object-cover" />
        <div dangerouslySetInnerHTML={{ __html: analysis }} />
      </div>

      <footer>
        <p className="text-center text-sm">
          <a href="https://www.youtube.com/@JulienLucas" className="text-white" target="_blank" rel="noopener noreferrer">🤍 Par @julienlucas sur Youtube</a>
        </p>
      </footer>
    </main>
  )
}

export default App
