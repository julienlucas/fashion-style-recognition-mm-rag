import { useState, useCallback, useEffect } from 'react';
const test1 = '/static/test-1.png'
const test2 = '/static/test-2.png'
const test3 = '/static/test-3.png'
const test4 = '/static/test-4.png'
const test5 = '/static/test-5.png'
const test6 = '/static/test-6.png'
// import test1 from "../../static/test-1.png"
// import test2 from "../../static/test-2.png"
// import test3 from "../../static/test-3.png"
// import test4 from "../../static/test-4.png"
// import test5 from "../../static/test-5.png"
// import test6 from "../../static/test-6.png"

function App() {
  // const test = "### Analyse Mode Professionnelle\n #### Description des Éléments Vestimentaires\n La tenue présentée sur l'image se compose des éléments suivants :\n\n 1. **Robe Noire** :\n\n - **Couleur** : Noire.\n\n - **Matière** : Probablement un tissu léger et fluide, tel que le polyester ou un mélange de fibres synthétiques.\n\n - **Coupe** : Sans manches, avec un décolleté rond et une longueur au-dessus du genou.\n\n 2. **Ceinture** :\n\n - **Couleur** : Noire avec une boucle dorée.\n\n - **Matière** : Cuir ou similicuir.\n\n - **Détails** : Une chaîne dorée est attachée à la ceinture, ajoutant une touche de sophistication.\n\n 3. **Collier** :\n\n - **Couleur** : Doré.\n\n - **Matière** : Métal doré, probablement de l'or ou un alliage doré.\n\n - **Design** : Un pendentif en forme de cercle avec une chaîne assortie.\n\n 4. **Lunettes** :\n\n - **Couleur** : Monture noire. \n\n - **Matière** : Plastique ou acétate.\n\n - **Design** : Monture épaisse et rectangulaire.\n\n 5. **Bague** :\n\n - **Couleur** : Dorée.\n\n - **Matière** : Métal doré, probablement de l'or ou un alliage doré.\n\n - **Design** : Bague fine avec un petit diamant.\n\n #### Analyse des Couleurs et Motifs\n - **Couleurs** : La tenue est dominée par le noir, avec des accents dorés apportés par les accessoires. Cette combinaison de couleurs crée un look élégant et sophistiqué.\n\n - **Motifs** : Aucun motif visible sur la robe ou les accessoires. Le design est minimaliste et épuré.\n #### Analyse des Matières\n - **Robe** :\n Le tissu semble léger et fluide, idéal pour une tenue de soirée ou un événement formel.\n\n - **Ceinture** :\n Le cuir ou similicuir ajoute une touche de luxe et de durabilité.\n\n - **Accessoires** :\n Les éléments dorés en métal apportent une touche de brillance et de sophistication.\n ### Articles Similaires\n Il est important de noter que les articles suivants sont similaires mais pas nécessairement identiques à ceux présentés sur l'image.\n\n - **Lunettes 'Little Dinger Glasses' de Chrome Hearts** (1639,00€) : https://go.shopmy.us/p-21755955\n\n - **Ceinture en Cuir 'Phoenix Leather Belt' de B Low The Belt** (\$155.00) : https://go.shopmy.us/p-21759996\n\n - **Bague en Or et Diamant 'Tattoo Gold Diamond Ring' de Ofira** (\$3,400.00) : https://go.shopmy.us/p-21759988\n\n - **Collier Vintage 'Vintage 1970s Ancient Bronze Coin Necklace' de For Future Reference** (\$10,940) : https://go.shopmy.us/p-21760010\n\n Ces articles peuvent être utilisés pour recréer un look similaire tout en offrant des options de personnalisation et de style."
  const [analysis, setAnalysis] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [lastRenderTime, setLastRenderTime] = useState(0)

  // Compteur de secondes quand isLoading est true
  useEffect(() => {
    let interval
    if (isLoading) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 0.1)
      }, 100)
    } else {
      if (seconds > 0) {
        setLastRenderTime(seconds)
      }
      setSeconds(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLoading, seconds])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const convertMarkdownToHtml = useCallback((text) => {
    return text
      .replace(/#### (.*?)(?=\n|$|####|###)/g, '<h3 class="mt-4 -mb-2">$1</h3>')
      .replace(/### (.*?)(?=\n|$|####|###)/g, '<h2 class="mt-4 -mb-2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(\d+\. \*\*.*?\*\* :)/g, '<h4>$1</h4>')
      .replace(/- \*\*(.*?)\*\* : (.*?)(?=\n-|\n\n|$)/g, '<li><strong>$1</strong> : $2</li>')
      .replace(/(<li>.*?<\/li>)/gs, '<ul class="list-disc list-inside mt-2">$1</ul>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files.find(file => file.type.startsWith('image/'))
    const url = URL.createObjectURL(file)
    const name = file.name

    setUploadedImage({ file, url, name })
  }, [])

  const handleImage = useCallback(async (image) => {
    // Convertir l'image de test en File object
    const response = await fetch(image)
    const blob = await response.blob()

    // Créer un nom de fichier approprié
    const name = image.split('/').pop().split('.')[0] + '.png'

    // Créer un File object avec le nom approprié
    const file = new File([blob], name, { type: 'image/png' })
    const url = URL.createObjectURL(file)

    setUploadedImage({ file, url, name })
  }, [])

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files)
    const file = files.find(file => file.type.startsWith('image/'))
    const url = URL.createObjectURL(file)
    const name = file.name

    setUploadedImage({ file, url, name })
  }, [])

  const removeImage = useCallback(() => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.url)
      setUploadedImage(null)
    }
  }, [uploadedImage])

  const analyzeImage = useCallback(async (image) => {
    setIsLoading(true)
    setAnalysis("")
    setImageUrl("")
    try {
      const formData = new FormData()

      const imageFile = image.file
      formData.append('image', imageFile)

      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      setAnalysis(convertMarkdownToHtml(data.message.bot_response))
      setImageUrl(data.message.closest_image_url)
    } catch (error) {
      setAnalysis(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [uploadedImage])

  const ImageNumber = ({ index }) => (
    <div className="absolute top-2 right-2 w-6 h-6 bg-black text-white flex items-center justify-center rounded-full text-xs">{index}</div>
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

      <div className="mx-auto max-w-3xl mt-8">
        <h2 className="text-center font-medium mb-13">Ce système IA analyse les tenues et propose une augmentation du style façon Taylor Swift.</h2>
      </div>

      <div className="mx-auto max-w-2xl mt-10">
        <div className="border border-black p-4 rounded-lg text-sm">
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
                <div className="absolute top-2 right-2 w-6 h-6 bg-black text-white flex items-center justify-center rounded-full text-xs cursor-pointer" onClick={removeImage}>X</div>
                <img src={uploadedImage.url} alt={uploadedImage.name} className="w-full h-full min-h-[510px] rounded-lg object-cover" />
                <button className="secondary" onClick={() => analyzeImage(uploadedImage)}>Analyser</button>
              </div>
            ) : (
              <div className={`w-full h-full min-h-[510px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 px-2 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-800 dark:border-gray-600'
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
                <div className="font-medium text-black dark:text-white mb-2">
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
        {isLoading && (
          <div className="flex items-center">
            <span className="text-sm">Analyse en cours... {seconds.toFixed(1)}s</span>
          </div>
        )}

        {!isLoading && lastRenderTime > 0 && (
          <div className="flex items-center">
            <span className="text-sm">Analyse terminée en {lastRenderTime.toFixed(1)}s</span>
          </div>
        )}

        {imageUrl && (
          <>
            <h3>Tenue trouvée la plus proche :</h3>
            <img src={imageUrl} className="w-[400px] h-[400px] my-4 rounded-lg object-cover" />
          </>
        )}
        <div dangerouslySetInnerHTML={{ __html: analysis }} />
      </div>

      <footer>
        <p className="text-center text-sm">
          <a href="https://www.youtube.com/@JulienLucas" className="text-black" target="_blank" rel="noopener noreferrer">🤍 Par @julienlucas sur Youtube</a>
        </p>
      </footer>
    </main>
  )
}

export default App
