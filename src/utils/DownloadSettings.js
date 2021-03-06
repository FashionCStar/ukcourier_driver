import React, { FC, useState, useMemo, Component } from 'react'
import { StyleSheet, Text, ActivityIndicator, Button } from 'react-native'
import Slider from '@react-native-community/slider'
import { Region } from 'react-native-maps'
import RNFS from 'react-native-fs';

import { tileGridForRegion } from '../utils/TileGrid'
import { TileConstants } from '../config'
import { Card } from 'native-base';

// type Props = {
//   mapRegion: Region
//   onFinish: () => void
// }

export default function DownloadSettings(props) {
  const [numZoomLevels, setZoomLevels] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const currentZoom = useMemo(() => {
    const zoom = calcZoom(props.mapRegion.longitudeDelta)
    return zoom
  }, [props.mapRegion])

  async function fetchTiles() {
    setIsLoading(true)

    const minZoom = currentZoom
    const maxZoom = currentZoom + numZoomLevels

    const tiles = tileGridForRegion(props.mapRegion, minZoom, maxZoom)

    // Create directory for tiles
    // TODO: Batch to speed up
    for (const tile of tiles) {
      const folder = `${TileConstants.TILE_FOLDER}/${tile.z}/${tile.x}`
      await RNFS.makeDirectoryAsync(folder, { intermediates: true })
      // await FileSystem.makeDirectoryAsync(folder, { intermediates: true })
    }

    // Download tiles in batches to avoid excessive promises in flight
    const BATCH_SIZE = 100

    let batch = []

    for (const tile of tiles) {
      const fetchUrl = `${TileConstants.MAP_URL}/${tile.z}/${tile.x}/${tile.y}.png`
      const localLocation = `${TileConstants.TILE_FOLDER}/${tile.z}/${tile.x}/${tile.y}.png`
      const tilePromise = RNFS.downloadAsync(fetchUrl, localLocation)
      batch.push(tilePromise)

      if (batch.length >= BATCH_SIZE) {
        await Promise.all(batch)
        batch = []
      }
    }

    await Promise.all(batch)

    alert('Finished downloading tiles, you are now viewing the offline map.')

    setIsLoading(false)
    props.onFinish()
  }

  return (
    <Card
      title={'Select number of zoom levels to download'}
      containerStyle={styles.container}>
      <Text style={styles.warningMessage}>
        Warning! Selecting a high detail level will take up more space.
      </Text>

      <Slider
        style={{
          marginBottom: 30,
          marginTop: 30,
        }}
        step={1}
        minimumValue={1}
        maximumValue={4}
        onValueChange={setZoomLevels}
      />

      {isLoading && <ActivityIndicator />}
      {!isLoading && <Button raised title="Dowload tiles" onPress={fetchTiles} />}
    </Card>
  )
}

function calcZoom(longitudeDelta) {
  return Math.round(Math.log(360 / longitudeDelta) / Math.LN2)
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  warningMessage: {
    marginVertical: 10,
    color: '#bbb',
    fontStyle: 'italic',
    fontSize: 10,
    textAlign: 'center',
  },
  estimate: {
    marginVertical: 15,
    textAlign: 'center',
  },
})
